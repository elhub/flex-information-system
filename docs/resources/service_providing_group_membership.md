# Service Providing Group Membership

The relation that links a controllable unit to a service providing group.
A service providing group can contain several controllable units, and a
controllable unit can belong to several groups at the same time.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_providing_group_membership)
* [Download docx](../download/service_providing_group_membership.docx)

## Fields

| Name                                                                                                               | Description                                                                                                                                       | Format                                 | Reference                                                         |
|--------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                         | Unique surrogate key.                                                                                                                             | bigint<br/>Read only                   |                                                                   |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a>                   | Reference to the controllable unit this relation links to a service providing group.                                                              | bigint<br/>Required<br/>Non-updatable  | [controllable_unit.id](controllable_unit.md#field-id)             |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a> | Reference to the service providing group this relation links to a controllable unit.                                                              | bigint<br/>Required<br/>Non-updatable  | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                                                 | The date from which the relation between the controllable unit and the service providing group is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Required  |                                                                   |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                                       | The date until which the relation between the controllable unit and the service providing group is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone               |                                                                   |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                              | When the resource was recorded (created or updated) in the system.                                                                                | timestamp with time zone<br/>Read only |                                                                   |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                              | The identity that recorded the resource.                                                                                                          | bigint<br/>Read only                   |                                                                   |

## Validation Rules

| Validation rule key | Validation rule                                                                             | Status |
|---------------------|---------------------------------------------------------------------------------------------|--------|
| SPGM-VAL001         | The controllable unit and service providing group must belong to the same service provider. | DONE   |
| SPGM-VAL002         | The controllable unit must be in the bidding zone defined on the SPG.                        | DONE   |

## Notifications

| Action                 | Recipient                       | Comment |
|------------------------|---------------------------------|---------|
| create, update, delete | SP of SPG, Impacted SO on SPGGP |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
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

| Policy key   | Policy                                                        | Status |
|--------------|---------------------------------------------------------------|--------|
| SPGM-FISO001 | Read, create, update and delete all SPG membership relations. | DONE   |
| SPGM-FISO002 | Read history on all SPG membership relations.                 | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                                | Status |
|------------|-------------------------------------------------------|--------|
| SPGM-SO001 | Read SPGM belonging to SPGs they can read.            | DONE   |
| SPGM-SO002 | Read history on SPGM belonging to SPGs they can read. | DONE   |

#### Service Provider

| Policy key | Policy                                                                                         | Status |
|------------|------------------------------------------------------------------------------------------------|--------|
| SPGM-SP001 | Create and update SPGM for SPGS that belongs to them, on periods where they are SP for the CU. | DONE   |
| SPGM-SP002 | Read, delete SPGM for SPGS that belongs to them.                                               | DONE   |
| SPGM-SP003 | Read history on SPGM for SPGS that belongs to them.                                            | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth/auth-model.md#party-market-actors)

| FIELD                      | ANON | BRP | ES | EU | FISO | MO | SO | SP  | TP | ORG |
|----------------------------|------|-----|----|----|------|----|----|-----|----|-----|
| id                         |      | R   | R  | R  | R    | R  | R  | R   | R  |     |
| controllable_unit_id       |      | R   | R  | R  | RC   | R  | R  | RC  | R  |     |
| service_providing_group_id |      | R   | R  | R  | RC   | R  | R  | RC  | R  |     |
| valid_from                 |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |     |
| valid_to                   |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |     |
| recorded_at                |      | R   | R  | R  | R    | R  | R  | R   | R  |     |
| recorded_by                |      | R   | R  | R  | R    | R  | R  | R   | R  |     |
