# Controllable Unit Suspension

The relation allowing an impacted system operator to temporarily suspend a
controllable unit.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_controllable_unit_suspension)
* [Download docx](../download/controllable_unit_suspension.docx)

## Fields

| Name                                                                                                                  | Description                                                                 | Format                                                                                   | Reference                                             |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                            | Unique surrogate identifier.                                                | bigint<br/>Read only                                                                     |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a>                      | Reference to the suspended controllable unit.                               | bigint<br/>Required<br/>Non-updatable                                                    | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-impacted_system_operator_id" href="#field-impacted_system_operator_id">impacted_system_operator_id</a> | Reference to the impacted system operator suspending the controllable unit. | bigint<br/>Non-updatable<br/><br/>Defaults to the system operator creating the resource. | [party.id](party.md#field-id)                         |
| <a name="field-reason" href="#field-reason">reason</a>                                                                | The reason for the suspension.                                              | text<br/>One of: `compromises_safe_operation`, `other`<br/>Required                      |                                                       |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                 | When the resource was recorded (created or updated) in the system.          | timestamp with time zone<br/>Read only                                                   |                                                       |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                 | The identity that recorded the resource.                                    | bigint<br/>Read only                                                                     |                                                       |

## Validation Rules

No validation rules

## Notifications

| Action                 | Recipient | Comment                                                                   |
|------------------------|-----------|---------------------------------------------------------------------------|
| create, update, delete | SP        | Service provider with current contract to the suspended controllable unit |
| create, update, delete | SO        | All ISOs                                                                  |

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

| Policy key  | Policy                                   | Status |
|-------------|------------------------------------------|--------|
| CUS-FISO001 | Create, read, update and delete all CUS. | DONE   |
| CUS-FISO002 | Read all CUS history.                    | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                            | Status |
|------------|---------------------------------------------------|--------|
| CUS-SO001  | Create, read, update and delete their own CUS.    | DONE   |
| CUS-SO002  | Read history on their own CUS.                    | DONE   |
| CUS-SO003  | Read CUS targeted at CUs they can see.            | DONE   |
| CUS-SO004  | Read history on CUS targeted at CUs they can see. | DONE   |

#### Service Provider

| Policy key | Policy                                                             | Status |
|------------|--------------------------------------------------------------------|--------|
| CUS-SP001  | Read CU suspensions overlapping with periods where they own the CU | DONE   |
| CUS-SP002  | Read history on CU suspensions on periods where they own the CU.   | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                       | ANON | BRP | ES | EU | FISO | MO | SO  | SP | TP | ORG |
|-----------------------------|------|-----|----|----|------|----|-----|----|----|-----|
| id                          |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| controllable_unit_id        |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| impacted_system_operator_id |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| reason                      |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
| recorded_at                 |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| recorded_by                 |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
