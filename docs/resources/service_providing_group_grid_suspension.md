# Service Providing Group Grid Suspension

The relation allowing an impacted system operator to temporarily suspend a
service providing group from delivering products.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_providing_group_grid_suspension)
* [Download docx](../download/service_providing_group_grid_suspension.docx)

## Fields

| Name                                                                                                                  | Description                                                                       | Format                                                                                   | Reference                                                         |
|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                            | Unique surrogate identifier.                                                      | bigint<br/>Read only                                                                     |                                                                   |
| <a name="field-impacted_system_operator_id" href="#field-impacted_system_operator_id">impacted_system_operator_id</a> | Reference to the impacted system operator suspending the service providing group. | bigint<br/>Non-updatable<br/><br/>Defaults to the system operator creating the resource. | [party.id](party.md#field-id)                                     |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a>    | Reference to the service providing group being suspended.                         | bigint<br/>Required<br/>Non-updatable                                                    | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-reason" href="#field-reason">reason</a>                                                                | The reason for the suspension.                                                    | text<br/>One of: `breach_of_conditions`, `significant_alteration`, `other`<br/>Required  |                                                                   |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                 | When the resource was recorded (created or updated) in the system.                | timestamp with time zone<br/>Read only                                                   |                                                                   |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                 | The identity that recorded the resource.                                          | bigint<br/>Read only                                                                     |                                                                   |

## Validation Rules

| Validation rule key | Validation rule                                                                          | Status |
|---------------------|------------------------------------------------------------------------------------------|--------|
| SPGGS-VAL001        | Service providing groups can only be suspended by ISOs by whom they are qualified.       | DONE   |

## Notifications

| Action                 | Recipient | Comment                                                             |
|------------------------|-----------|---------------------------------------------------------------------|
| create, update, delete | SP        | Suspended SP                                                        |
| create, update, delete | SO        | All ISOs and all PSOs for which the SPG is prequalified or verified |

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
| SPGGS-FISO001 | Create, read, update and delete all SPGGS. | DONE   |
| SPGGS-FISO002 | Read all SPGGS history.                    | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                                                                                       | Status |
|-------------|--------------------------------------------------------------------------------------------------------------|--------|
| SPGGS-SO001 | Create, read, update and delete their own SPGGS.                                                             | DONE   |
| SPGGS-SO002 | Read history on their own SPGGS.                                                                             | DONE   |
| SPGGS-SO003 | Read SPGGS targeted at any SPG for which they have prequalified or verified a product application.           | DONE   |
| SPGGS-SO004 | Read history on SPGGS targeted at any SPG for which they had prequalified or verified a product application. | DONE   |
| SPGGS-SO005 | Read SPGGS targeted at any SPG for which they have approved a grid prequalification.                         | DONE   |
| SPGGS-SO006 | Read history on SPGGS targeted at any SPG for which they had approved a grid prequalification.               | DONE   |

#### Service Provider

| Policy key  | Policy                                      | Status |
|-------------|---------------------------------------------|--------|
| SPGGS-SP001 | Read SPGGS targeting their SPGs.            | DONE   |
| SPGGS-SP002 | Read history on SPGGS targeting their SPGs. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                       | ANON | BRP | ES | EU | FISO | MO | SO  | SP | TP | ORG |
|-----------------------------|------|-----|----|----|------|----|-----|----|----|-----|
| id                          |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| impacted_system_operator_id |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| service_providing_group_id  |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| reason                      |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
| recorded_at                 |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| recorded_by                 |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
