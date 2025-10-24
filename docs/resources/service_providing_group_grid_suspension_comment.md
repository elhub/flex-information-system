# Service Providing Group Grid Suspension Comment

Comment made by a party involved in a service providing group grid suspension.
Several comments can be added to a given suspension.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_providing_group_grid_suspension_comment)
* [Download docx](../download/service_providing_group_grid_suspension_comment.docx)

## Fields

| Name                                                                                                                                                               | Description                                                        | Format                                                                                                                                                                                                                                                              | Reference                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                         | Unique surrogate identifier.                                       | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                   |
| <a name="field-service_providing_group_grid_suspension_id" href="#field-service_providing_group_grid_suspension_id">service_providing_group_grid_suspension_id</a> | Reference to the service providing group grid suspension.          | bigint<br/>Required<br/>Non-updatable                                                                                                                                                                                                                               | [service_providing_group_grid_suspension.id](service_providing_group_grid_suspension.md#field-id) |
| <a name="field-created_by" href="#field-created_by">created_by</a>                                                                                                 | Reference to the identity that created the comment.                | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                   |
| <a name="field-created_at" href="#field-created_at">created_at</a>                                                                                                 | When the comment was added to the SPGGS.                           | timestamp with time zone<br/>Read only                                                                                                                                                                                                                              |                                                                                                   |
| <a name="field-visibility" href="#field-visibility">visibility</a>                                                                                                 | The level of visibility of the comment.                            | text<br/>One of: `same_party`, `any_involved_party`<br/>Default: `same_party`<br/><br/>Comments marked `same_party` are visible only to the party that creates them, whereas comments marked `any_involved_party` can be seen by all parties involved in the SPGGS. |                                                                                                   |
| <a name="field-content" href="#field-content">content</a>                                                                                                          | Free text content of the comment.                                  | text<br/>Required<br/>Max length: `2048`<br/><br/>This field can contain rich text in raw HTML format. Its content should be sanitised on the client side before being displayed, as there is currently no check performed on the server.                           |                                                                                                   |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                                                              | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only                                                                                                                                                                                                                              |                                                                                                   |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                                                              | The identity that recorded the resource.                           | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                   |

## Validation Rules

No validation rules.

## Notifications

| Action         | Recipient                                         | Comment |
|----------------|---------------------------------------------------|---------|
| create, update | ISO and SP of SPGGS when they can see the comment |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key    | Policy                                         | Status |
|---------------|------------------------------------------------|--------|
| SPGGSC-COM001 | Update SPGGSC that they created.               | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key     | Policy                              | Status |
|----------------|-------------------------------------|--------|
| SPGGSC-FISO001 | Read, create and update all SPGGSC. | DONE   |
| SPGGSC-FISO002 | Read history on all SPGGSC.         | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key   | Policy                                            | Status |
|--------------|---------------------------------------------------|--------|
| SPGGSC-SO001 | Create SPGGSC on SPGGS where they are ISO.        | DONE   |
| SPGGSC-SO002 | Read SPGGSC that the visibility allows.           | DONE   |
| SPGGSC-SO003 | Read history on SPPSC that the visibility allows. | DONE   |

#### Service Provider

| Policy key   | Policy                                             | Status |
|--------------|----------------------------------------------------|--------|
| SPGGSC-SP001 | Create SPGGSC on SPGGS where they are SP.          | DONE   |
| SPGGSC-SP002 | Read SPGGSC that the visibility allows.            | DONE   |
| SPGGSC-SP003 | Read history on SPGGSC that the visibility allows. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                                      | ANON | BRP | ES | EU | FISO | MO | SO  | SP  | TP | ORG |
|--------------------------------------------|------|-----|----|----|------|----|-----|-----|----|-----|
| id                                         |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| service_providing_group_grid_suspension_id |      | R   | R  | R  | RC   | R  | RC  | RC  | R  |     |
| created_by                                 |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| created_at                                 |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| visibility                                 |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| content                                    |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| recorded_at                                |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| recorded_by                                |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
