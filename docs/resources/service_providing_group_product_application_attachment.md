# Service Providing Group Product Application Attachment

File attachment associated with a service providing group product application,
allowing the service providers to upload supporting documents.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/list_service_providing_group_product_application_attachment)

## Fields

| Name                                                                                                                                                                           | Description                                                   | Format                                          | Reference                                                                                                 |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                                     | Unique surrogate identifier.                                  | bigint<br/>Read only                            |                                                                                                           |
| <a name="field-service_providing_group_product_application_id" href="#field-service_providing_group_product_application_id">service_providing_group_product_application_id</a> | Reference to the service providing group product application. | bigint<br/>Required<br/>Non-updatable           | [service_providing_group_product_application.id](service_providing_group_product_application.md#field-id) |
| <a name="field-name" href="#field-name">name</a>                                                                                                                               | Original filename of the uploaded file.                       | text<br/>Required<br/>Max length: 256           |                                                                                                           |
| <a name="field-content_type" href="#field-content_type">content_type</a>                                                                                                       | MIME type of the uploaded file.                               | text<br/>Required<br/>One of: `application/pdf` |                                                                                                           |
| <a name="field-size_bytes" href="#field-size_bytes">size_bytes</a>                                                                                                             | Size of the uploaded file in bytes.                           | bigint<br/>Required                             |                                                                                                           |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                                                                          | When the attachment was recorded in the system.               | date-time<br/>Read only                         |                                                                                                           |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                                                                          | The identity that recorded the attachment.                    | bigint<br/>Read only                            |                                                                                                           |

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
| name                                           |      | R   | R  | R  | RC   | R  | RC | R  |     |
| content_type                                   |      | R   | R  | R  | RC   | R  | RC | R  |     |
| size_bytes                                     |      | R   | R  | R  | RC   | R  | RC | R  |     |
| recorded_at                                    |      | R   | R  | R  | R    | R  | R  | R  |     |
| recorded_by                                    |      | R   | R  | R  | R    | R  | R  | R  |     |
