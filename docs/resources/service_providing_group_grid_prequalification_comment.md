# Service Providing Group Grid Prequalification Comment

Comment made by a party involved in a service providing group prequalification
Several comments can be added to a given prequalification.

For information about comments as a concept see [Communication and Coordination](../concepts/communication-and-coordination.md).

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_providing_group_grid_prequalification_comment)
* [Download docx](../download/service_providing_group_grid_prequalification_comment.docx)

## Fields

| Name                                                                                                                                                                                 | Description                                                        | Format                                                                                                                                                                                                                                                              | Reference                                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                                           | Unique surrogate identifier.                                       | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                               |
| <a name="field-service_providing_group_grid_prequalification_id" href="#field-service_providing_group_grid_prequalification_id">service_providing_group_grid_prequalification_id</a> | Reference to the service providing group grid prequalification.    | bigint<br/>Required<br/>Non-updatable                                                                                                                                                                                                                               | [service_providing_group_grid_prequalification.id](service_providing_group_grid_prequalification.md#field-id) |
| <a name="field-created_by" href="#field-created_by">created_by</a>                                                                                                                   | Reference to the identity that created the comment.                | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                               |
| <a name="field-created_at" href="#field-created_at">created_at</a>                                                                                                                   | When the comment was added to the SPGGP.                           | date-time<br/>Read only                                                                                                                                                                                                                                             |                                                                                                               |
| <a name="field-visibility" href="#field-visibility">visibility</a>                                                                                                                   | The level of visibility of the comment.                            | text<br/>One of: `same_party`, `any_involved_party`<br/>Default: `same_party`<br/><br/>Comments marked `same_party` are visible only to the party that creates them, whereas comments marked `any_involved_party` can be seen by all parties involved in the SPGGP. |                                                                                                               |
| <a name="field-content" href="#field-content">content</a>                                                                                                                            | Free text content of the comment.                                  | text<br/>Required<br/>Max length: `2048`<br/><br/>This field can contain rich text in raw HTML format. Its content should be sanitised on the client side before being displayed, as there is currently no check performed on the server.                           |                                                                                                               |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                                                                                | When the resource was recorded (created or updated) in the system. | date-time<br/>Read only                                                                                                                                                                                                                                             |                                                                                                               |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                                                                                | The identity that recorded the resource.                           | bigint<br/>Read only                                                                                                                                                                                                                                                |                                                                                                               |

## Validation Rules

No validation rules.

## Notifications

| Action         | Recipient                                         | Comment |
|----------------|---------------------------------------------------|---------|
| create, update | ISO and SP of SPGGP when they can see the comment |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key    | Policy                           | Status |
|---------------|----------------------------------|--------|
| SPGGPC-COM001 | Update SPGGPC that they created. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key     | Policy                              | Status |
|----------------|-------------------------------------|--------|
| SPGGPC-FISO001 | Read, create and update all SPGGPC. | DONE   |
| SPGGPC-FISO002 | Read history on all SPGGPC.         | DONE   |

#### Organisation

No policies.

#### System Operator

| Policy key   | Policy                                                   | Status |
|--------------|----------------------------------------------------------|--------|
| SPGGPC-SO001 | Create SPGGPC on SPGGP where they are ISO.               | DONE   |
| SPGGPC-SO002 | Read SPGGPC that the visibility allows.                  | DONE   |
| SPGGPC-SO003 | Read history on SPGGP that the latest visibility allows. | DONE   |

#### Service Provider

| Policy key   | Policy                                                    | Status |
|--------------|-----------------------------------------------------------|--------|
| SPGGPC-SP001 | Create SPGGPC on SPGGP where they are SP.                 | DONE   |
| SPGGPC-SP002 | Read SPGGPC that the visibility allows.                   | DONE   |
| SPGGPC-SP003 | Read history on SPGGPC that the latest visibility allows. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD                                            | ANON | BRP | ES | EU | FISO | SO  | SP  | TP | ORG |
|--------------------------------------------------|------|-----|----|----|------|-----|-----|----|-----|
| id                                               |      | R   | R  | R  | R    | R   | R   | R  |     |
| service_providing_group_grid_prequalification_id |      | R   | R  | R  | RC   | RC  | RC  | R  |     |
| created_by                                       |      | R   | R  | R  | R    | R   | R   | R  |     |
| created_at                                       |      | R   | R  | R  | R    | R   | R   | R  |     |
| visibility                                       |      | R   | R  | R  | RCU  | RCU | RCU | R  |     |
| content                                          |      | R   | R  | R  | RCU  | RCU | RCU | R  |     |
| recorded_at                                      |      | R   | R  | R  | R    | R   | R   | R  |     |
| recorded_by                                      |      | R   | R  | R  | R    | R   | R   | R  |     |
