# Controllable Unit Suspension

The relation allowing an impacted system operator to temporarily suspend a
controllable unit.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_controllable_unit_suspension_comment)
* [Download docx](../download/controllable_unit_suspension_comment.docx)

## Fields

| Name                                                                                                                              | Description                                                        | Format                                                                                                                                                                                                                                                            | Reference                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                        | Unique surrogate identifier.                                       | bigint<br/>Read only                                                                                                                                                                                                                                              |                                                                             |
| <a name="field-controllable_unit_suspension_id" href="#field-controllable_unit_suspension_id">controllable_unit_suspension_id</a> | Reference to the controllable unit suspension.                     | bigint<br/>Required<br/>Non-updatable                                                                                                                                                                                                                             | [controllable_unit_suspension.id](controllable_unit_suspension.md#field-id) |
| <a name="field-created_by" href="#field-created_by">created_by</a>                                                                | Reference to the identity that created the comment.                | bigint<br/>Read only                                                                                                                                                                                                                                              |                                                                             |
| <a name="field-created_at" href="#field-created_at">created_at</a>                                                                | When the comment was added to the CUS.                             | timestamp with time zone<br/>Read only                                                                                                                                                                                                                            |                                                                             |
| <a name="field-visibility" href="#field-visibility">visibility</a>                                                                | The level of visibility of the comment.                            | text<br/>One of: `same_party`, `any_involved_party`<br/>Default: `same_party`<br/><br/>Comments marked `same_party` are visible only to the party that creates them, whereas comments marked `any_involved_party` can be seen by all parties involved in the CUS. |                                                                             |
| <a name="field-content" href="#field-content">content</a>                                                                         | Free text content of the comment.                                  | text<br/>Required<br/>Max length: `2048`<br/><br/>This field can contain rich text in raw HTML format. Its content should be sanitised on the client side before being displayed, as there is currently no check performed on the server.                         |                                                                             |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                             | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only                                                                                                                                                                                                                            |                                                                             |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                             | The identity that recorded the resource.                           | bigint<br/>Read only                                                                                                                                                                                                                                              |                                                                             |

## Validation Rules

No validation rules

## Notifications

| Action                 | Recipient | Comment                                                                   |
|------------------------|-----------|---------------------------------------------------------------------------|
| create, update, delete | SP        | Service provider with current contract to the suspended controllable unit |
| create, update, delete | SO        | Impacted SO                                                                  |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

No policies.

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key  | Policy                          | Status |
|-------------|---------------------------------|--------|
| CUSC-FISO001 | Create, read, update all CUSC. | DONE   |
| CUSC-FISO002 | Read all CUSC histor           | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                                   | Status |
|------------|----------------------------------------------------------|--------|
| CUSC-SO001  | Create CUSC on CUS where they are impacted SO.          | DONE   |
| CUSC-SO002  | Read CUSC that the visibility allows.                   | DONE   |
| CUSC-SO003  | Read history on CUSC that the latest visibility allows. | DONE   |

#### Service Provider

| Policy key | Policy                                                   | Status |
|------------|----------------------------------------------------------|--------|
| CUSC-SP001  | Create CUSC where they own the CU                       | DONE   |
| CUSC-SP002  | Read CUSC that the visibility allows                    | DONE   |
| CUSC-SP003  | Read history on CUSC that the latest visibility allows. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                | ANON | BRP | ES | EU | FISO | MO | SO  | SP  | TP | ORG |
|----------------------|------|-----|----|----|------|----|-----|-----|----|-----|
| id                   |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| controllable_unit_id |      | R   | R  | R  | RC   | R  | RC  | RC  | R  |     |
| created_at           |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| created_by           |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| visibility           |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| content              |      | R   | R  | R  | RCU  | R  | RCU | RCU | R  |     |
| recorded_at          |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
| recorded_by          |      | R   | R  | R  | R    | R  | R   | R   | R  |     |
