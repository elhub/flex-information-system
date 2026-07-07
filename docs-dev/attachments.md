# Attachments

This document gathers design notes on the attachments resources we have in the
system. Attachments are inspired from comments and are designed to behave as a
form of child resource living under another resource in our system. The goal is
to be able to upload files in the context of applications for instance, to give
technical details or contracts.

## Data layout

We need to store in our system both file metadata and the actual file contents.
We store the metadata as a table in our database and the file contents on an
external storage container (S3 bucket). This allows keeping the database as a
source of truth (namely for maintaining consistency) without putting too much
pressure on our it when it comes to disk space and I/O.

A given resource `res` with attachments enabled will be associated to a
`res_attachment` table containing information like the file name, file type,
file size, upload timestamp and identity of the user uploading, as well as a
unique reference to the object in the storage container containing the file.

## API design

The attachment table is then exposed in the API so that users can read metadata,
but we also expose endpoints to upload and delete files.

### Reading attachments

The endpoints to read metadata look like the _list_ and _read_ kind of endpoints
we already have on other resources in the system, except the list endpoint
_requires_ a parent resource ID, because we consider it does not make sense to
query for all attachments regardless of their parent resource.

These endpoints are protected by RLS policies specific to the resource and the
`res_id` on each attachment.

Here is an example of list and read call, on a resource having an image and a
PDF attached:

```http
GET /res_attachment?res_id=eq.12
```

```json
[
  {
    "id": 15,
    "res_id": 12,
    "name": "a.jpg",
    "content_type": "image/jpeg",
    "size_bytes": 12149102,
    "recorded_at": "2026-07-01T14:05:39+01:00",
    "recorded_by": 17
  },
  {
    "id": 19,
    "res_id": 12,
    "name": "b.pdf",
    "content_type": "application/pdf",
    "size_bytes": 58010098,
    "recorded_at": "2026-06-24T09:17:48+01:00",
    "recorded_by": 30
  }
]
```

```http
GET /res_attachment/19
```

```json
{
  "id": 19,
  "res_id": 12,
  "name": "b.pdf",
  "content_type": "application/pdf",
  "size_bytes": 58010098,
  "recorded_at": "2026-06-24T09:17:48+01:00",
  "recorded_by": 30
}
```

To read the file contents, we need another endpoint that will have the same
authorisation as the metadata read endpoint, as metadata needs to be read before
the file can be fetched from the storage container.

```http
GET /res_attachment/19/download
```

For performance reasons, this endpoint does not directly return the contents of
the file, but instead uses a redirect mechanism so that the user is sent to an
URL in the storage container to download the file. Whether the file is opened in
the browser or downloaded depends on the `Content-Disposition` header that we
set on redirect. We choose to download by default here.

We do not expose the pointer to the storage container object in the API as it is
not used in the endpoint paths and can be considered to be an internal
implementation detail.

### Uploading and deleting files

File upload is a non-standard endpoint as it needs to receive the file contents
in the body. The user uses a multipart form with a part containing the reference
to the resource the attachment will belong to, and a part containing the file
contents as well as the filename.

Here is an example of call to the upload endpoint:

```http
POST /res_attachment
Content-Type: multipart/form-data; boundary=----ResFormBoundaryABCDEF

----ResFormBoundaryABCDEF
Content-Disposition: form-data; name="res_id"

12
----ResFormBoundaryABCDEF
Content-Disposition: form-data; name="file"; filename="c.pdf"
Content-Type: application/pdf

[binary data of the PDF]
----ResFormBoundaryABCDEF
```

```json
{
  "id": 27,
  "res_id": 12,
  "name": "c.pdf",
  "content_type": "application/pdf",
  "size_bytes": 70440701,
  "recorded_at": "2026-07-03T13:55:08+01:00",
  "recorded_by": 10
}
```

Deleting this file can be done with the delete endpoint with the attachment row
ID:

```text
DELETE /res_attachment/27
```

Rules for who can upload or delete a file are also specified with RLS policies
on `INSERT` or `DELETE` on the metadata table, as metadata is always created or
deleted in the handler at the same time as the actual file is stored or removed.

## Storage

In addition to the database and the API endpoints, we need to decide what we
store in the storage container, in which format exactly, and how we make the
link between metadata and storage.

### Data quality

When the users upload files, we do not trust the `Content-Type` header and
instead perform an elementary check on the binary data to determine the file
type. Then, according to the file type, we run a dedicated parser on the file
contents to ensure structural validity of the documents. However, we do not
necessarily have to run some form of antivirus software on the files as we do
not use them in the software but only store them, and the users uploading them
can be trusted to a certain degree.

### Storage container data format

The storage container stores data in a key-value format in principle, but we can
play on the content of these two.

First, the key can be stored in a path-like format so that we do not only have a
flat logical hierarchy, even though the physical hierarchy will remain flat. We
can therefore store a key like `/res_attachment/{res_id}/{object_id}` for
instance.

Second, the value can be stored in a compressed format so network calls go
faster. This can be done by compressing file contents with GZIP in the upload
endpoint, before sending them to the storage container. We can also set the
encoding headers on the responses of the download endpoint so that the users
know it is encoded data we are returning. The endpoint must therefore check that
the users accept such encoded data.

In addition, in the storage container's API, we can provide a
`Content-Disposition` header storing the filename and whether we want the file
to be downloaded or opened when we query it later.

### Consistency challenge

As we are storing data in two different places, we need to ensure consistency
between them, not necessarily at all times, but some form of _eventual_
consistency.

We decided that the metadata table should be the source of truth, so storing an
attachment in the system amounts to creating a metadata row and deleting the
attachment amounts to deleting this row.

The storage container operations are therefore done in a way that we think it as
a dependency:

- an object ID represents a reference, so we consider it _necessary_ for the
  object to exist in the storage container before we create the metadata row
- deleting the object in the storage container can be considered as an internal
  operation to perform in the background: as long as the metadata is deleted,
  the object is no longer visible/reachable from our API, so it is effectively
  "deleted".

In theory, this ensures that we never have a metadata row pointing to an object
that does not exist, given that nothing other than our system interacts with the
storage container.

Both points above mean, however, that we accept the possibility of having dead
objects in the storage container. Indeed, a network error after upload before
creating the metadata can cause duplicates, losing the reference to the oldest
one, as the API returns an error and we lose the object ID forever. And a
network error after deleting metadata will be made silent because we do not want
to return an internal server error on a delete operation if not strictly
necessary, for user experience reasons. There we also lose the object ID
forever. To solve this issue, we can have a background worker that sometimes
goes through all objects in the storage container and all attachments in our
system, and deletes objects that are no longer referenced, because the system
has no way to use them anyway.

## Factorisation

As this feature looks like the comments feature implemented earlier, we can take
inspiration from it, making sure common classes and components are used, and
harnessing code generation where possible.

### Backend implementation

In the backend, the various attachment resources will have a similar structure,
only varying in the base resource name, so we can define generic classes for the
handlers and routes, and use a common class representing the service contacting
the storage container or validating the uploaded files.

### Code generation

Attachments should be enabled on a resource by setting an `attachments: true`
property in the `resources.yml` file, as we do for comments. We should then use
SQL and YAML templates to define attachment metadata tables, grants, _etc._, and
fill the OpenAPI specification automatically.

### Common UI component

Attachments will look the same on all pages: on a resource having attachments
enabled, we should see a list of attachments where each value is clickable and
leads to downloading the file, a delete button on each attachment with a popup
to confirm and ensure the user really wants to delete the file as this cannot be
undone, as well as a plus (`+`) button to add a new attachment. All these should
be generic components parameterised by the base resource name and ID.
