# Service Provider Product Application Comment

Comment made by a party involved in a service provider product application.
Several comments can be added to a given application.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_provider_product_application_comment)
* [Download docx](../download/service_provider_product_application_comment.docx)

## Fields

| Name                                                                                                                                                      | Description                                                        | Format                                                                                                                                                                                                                                                                                                                                                         | Reference                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                | Unique surrogate identifier.                                       | bigint<br/>Read only                                                                                                                                                                                                                                                                                                                                           |                                                                                             |
| <a name="field-service_provider_product_application_id" href="#field-service_provider_product_application_id">service_provider_product_application_id</a> | Reference to the service provider product application.             | bigint<br/>Required<br/>Non-updatable                                                                                                                                                                                                                                                                                                                          | [service_provider_product_application.id](service_provider_product_application.md#field-id) |
| <a name="field-created_by" href="#field-created_by">created_by</a>                                                                                        | Reference to the identity that created the comment.                | bigint<br/>Read only                                                                                                                                                                                                                                                                                                                                           |                                                                                             |
| <a name="field-created_at" href="#field-created_at">created_at</a>                                                                                        | When the comment was added to the application.                     | timestamp with time zone<br/>Read only                                                                                                                                                                                                                                                                                                                         |                                                                                             |
| <a name="field-visibility" href="#field-visibility">visibility</a>                                                                                        | The level of visibility of the comment.                            | text<br/>One of: `same_party`, `same_party_type`, `any_party`<br/>Default: `same_party`<br/><br/>Comments marked `same_party` are visible only to the party that creates them, whereas comments marked `same_party_type` can be seen by all parties of the same type, and comments marked `any_party` are visible to all parties that can see the application. |                                                                                             |
| <a name="field-content" href="#field-content">content</a>                                                                                                 | Free text content of the comment.                                  | text<br/>Required<br/>Max length: `2048`<br/><br/>This field can contain rich text in raw HTML format. Its content should be sanitised on the client side before being displayed, as there is currently no check performed on the server.                                                                                                                      |                                                                                             |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                                                     | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only                                                                                                                                                                                                                                                                                                                         |                                                                                             |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                                                     | The identity that recorded the resource.                           | bigint<br/>Read only                                                                                                                                                                                                                                                                                                                                           |                                                                                             |

## Validation Rules

No validation rules.

## Notifications

| Action         | Recipient         | Comment |
|----------------|-------------------|---------|
| create, update | SO and SP of SPPA |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key   | Policy                                        | Status |
|--------------|-----------------------------------------------|--------|
| SPPAC-COM001 | Read history on SPPAC that they can read.     | DONE   |
| SPPAC-COM002 | Update SPPAC that they created.               | DONE   |
| SPPAC-COM003 | Create SPPAC on SPPA that they are linked to. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key    | Policy                             | Status |
|---------------|------------------------------------|--------|
| SPPAC-FISO001 | Read, create and update all SPPAC. | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                            | Status |
|-------------|---------------------------------------------------|--------|
| SPPAC-SO001 | Read SPPAC that the visibility allows.            | DONE   |

#### Service Provider

| Policy key  | Policy                                            | Status |
|-------------|---------------------------------------------------|--------|
| SPPAC-SP001 | Read SPPAC that the visibility allows.            | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                                   | ANON | BRP | ES | EU | FISO | MO | SO  | SP  | TP | ORG |
|-----------------------------------------|------|-----|----|----|------|----|-----|-----|----|-----|
| id                                      |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| service_provider_product_application_id |      | R   | R  | R  | RC   | R  | RC  | RC  | R  |     |
| created_by                              |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| created_at                              |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| visibility                              |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| content                                 |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| recorded_at                             |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| recorded_by                             |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
