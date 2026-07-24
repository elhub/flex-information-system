# Service Providing Group Product Application Attachment

File attachment associated with a service providing group product application,
allowing involved parties to exchange supporting documents.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/list_service_providing_group_product_application_attachment)
* [Download docx](../download/service_providing_group_product_application_attachment.docx)

## Fields

| Name                                                                                                                                                                           | Description                                                        | Format                                                                     | Reference                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                                     | Unique surrogate identifier.                                       | bigint<br/>Read only                                                       |                                                                                                           |
| <a name="field-service_providing_group_product_application_id" href="#field-service_providing_group_product_application_id">service_providing_group_product_application_id</a> | Reference to the service providing group product application.      | bigint<br/>Required<br/>Non-updatable                                      | [service_providing_group_product_application.id](service_providing_group_product_application.md#field-id) |
| <a name="field-object_id" href="#field-object_id">object_id</a>                                                                                                                | Identifier of the object to which the attachment is linked.        | text<br/>Required                                                          |                                                                                                           |
| <a name="field-filename" href="#field-filename">filename</a>                                                                                                                   | Original filename of the attachment.                               | text<br/>Required                                                          |                                                                                                           |
| <a name="field-filename_sanitised" href="#field-filename_sanitised">filename_sanitised</a>                                                                                     | Sanitised filename safe for storage.                               | text<br/>Required                                                          |                                                                                                           |
| <a name="field-content_type" href="#field-content_type">content_type</a>                                                                                                       | MIME type of the attachment.                                       | text<br/>One of: `application/pdf`, `image/jpeg`, `image/png`<br/>Required |                                                                                                           |
| <a name="field-size_bytes" href="#field-size_bytes">size_bytes</a>                                                                                                             | Size of the attachment in bytes.                                   | bigint<br/>Required                                                        |                                                                                                           |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                                                                          | When the resource was recorded (created or updated) in the system. | date-time<br/>Read only                                                    |                                                                                                           |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                                                                          | The identity that recorded the resource.                           | bigint<br/>Read only                                                       |                                                                                                           |

## Validation Rules

No validation rules.

## Notifications

| Action         | Recipient               | Comment |
|----------------|-------------------------|---------|
| create, update | Procuring SO, SP of SPG |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth/authz-model.md#resource-level-authorization-rla) for the resource.
The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key    | Policy                                          | Status |
|---------------|-------------------------------------------------|--------|
| SPGPAA-COM001 | Read attachments for SPGPAs that they can read. | DONE   |

#### Flexibility Information System Operator

| Policy key     | Policy                                   | Status |
|----------------|------------------------------------------|--------|
| SPGPAA-FISO001 | Read, create and delete all attachments. | DONE   |

#### Service Provider

| Policy key   | Policy                                                                        | Status |
|--------------|-------------------------------------------------------------------------------|--------|
| SPGPAA-SP001 | Create, read and delete attachments for SPGPAs on SPGs they are in charge of. | DONE   |

#### Other roles

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../auth/authn-model.md#party-market-actors).

| FIELD                                          | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|------------------------------------------------|------|-----|----|----|------|----|----|----|-----|
| id                                             |      | R   | R  | R  | R    | R  | R  | R  |     |
| service_providing_group_product_application_id |      | R   | R  | R  | RC   | R  | RC | R  |     |
| object_id                                      |      | R   | R  | R  | RC   | R  | RC | R  |     |
| filename                                       |      | R   | R  | R  | RC   | R  | RC | R  |     |
| filename_sanitised                             |      | R   | R  | R  | RC   | R  | RC | R  |     |
| content_type                                   |      | R   | R  | R  | RC   | R  | RC | R  |     |
| size_bytes                                     |      | R   | R  | R  | RC   | R  | RC | R  |     |
| recorded_at                                    |      | R   | R  | R  | R    | R  | R  | R  |     |
| recorded_by                                    |      | R   | R  | R  | R    | R  | R  | R  |     |
