# Controllable Unit Suspension

The relation allowing an impacted system operator to temporarily suspend a
Controllable Unit from delivering services.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_controllable_unit_suspension)
* [Download docx](../download/controllable_unit_suspension.docx)

## Fields

| Name                                                                                                                  | Description                                                                   | Format                                                              | Reference                                             |
|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|---------------------------------------------------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                            | Unique surrogate identifier.                                                  | bigint<br/>Read only                                                |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a>                      | Reference to the controllable unit this relation links to a service provider. | bigint<br/>Required<br/>Non-updatable                               | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-impacted_system_operator_id" href="#field-impacted_system_operator_id">impacted_system_operator_id</a> | Reference to the `party` that is the impacted system operator.                | bigint<br/>Required<br/>Non-updatable                               | [party.id](party.md#field-id)                         |
| <a name="field-reason" href="#field-reason">reason</a>                                                                | The reason for the suspension.                                                | text<br/>One of: `compromises_safe_operation`, `other`<br/>Required |                                                       |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                 | When the resource was recorded (created or updated) in the system.            | timestamp with time zone<br/>Read only                              |                                                       |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                 | The identity that recorded the resource.                                      | bigint<br/>Read only                                                |                                                       |

## Validation Rules

| Validation rule key | Validation rule                                                                          | Status |
|---------------------|------------------------------------------------------------------------------------------|--------|
| CUS-VAL001        | Controllable Units can only be suspended by ISOs by whom they are qualified.       | DONE   |

## Notifications

| Action                 | Recipient | Comment                                                             |
|------------------------|-----------|---------------------------------------------------------------------|
| create, update, delete | SP        | Suspended SP                                                        |
| create, update, delete | SO        | All ISOs and all PSOs for which the CU is prequalified or verified |

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

| Policy key    | Policy                                     | Status |
|---------------|--------------------------------------------|--------|
| CUS-FISO001 | Create, read, update and delete all CUS. | DONE   |
| CUS-FISO002 | Read all CUS history.                    | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                               | Status |
|-------------|------------------------------------------------------|--------|
| CUS-SO001 | Create, read, update and delete their own CUS.     | DONE   |
| CUS-SO002 | Read history on their own CUS.                     | DONE   |
| CUS-SO003 | Read CUS targeted at CUs they can see.            | DONE   |
| CUS-SO004 | Read history on CUS targeted at CUs they can see. | DONE   |

#### Service Provider

| Policy key  | Policy                                      | Status |
|-------------|---------------------------------------------|--------|
| CUS-SP001 | Read CUS targeting their CUs.            | DONE   |
| CUS-SP002 | Read history on CUS targeting their CUs. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                       | ANON | BRP | ES | EU | FISO | MO | SO  | SP | TP | ORG |
|-----------------------------|------|-----|----|----|------|----|-----|----|----|-----|
| id                          |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| controllable_unit_id        |      | R   | R  | R  | RC   | R  | R   | RC | R  |     |
| impacted_system_operator_id |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| service_provider_id         |      | R   | R  | R  | RC   | R  | R   | RC | R  |     |
| reason                      |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
