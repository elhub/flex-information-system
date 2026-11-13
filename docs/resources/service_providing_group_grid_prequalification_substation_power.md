# Service Providing Group Grid Prequalification Substation Power

Flexible power per substation for a service providing group grid
prequalification, together with the total approved flexible power for each
substation across all approved grid prequalifications of the same impacted
system operator.

The total approved flexible power of a substation is the sum of the maximum
active power of the controllable units that:

* are current members of a service providing group with a grid prequalification
  for the impacted system operator in status `approved` or
  `conditionally_approved`, and
* became members of the group before or at the time of the approval of that grid
  prequalification (`prequalified_at`), so that controllable units added after the
  approval are not counted until the changes are approved, and
* have the impacted system operator as system operator of their accounting point,
  and
* are located at the substation.

Each controllable unit is counted once, even if it is a member of several
approved service providing groups. Controllable units without a substation are
not included.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/list_service_providing_group_grid_prequalification_substation_power)
* [Download docx](../download/service_providing_group_grid_prequalification_substation_power.docx)

## Fields

| Name                                                                                                                                                                                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Format               | Reference                                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|---------------------------------------------------------------------------------------------------------------|
| <a name="field-service_providing_group_grid_prequalification_id" href="#field-service_providing_group_grid_prequalification_id">service_providing_group_grid_prequalification_id</a> | The ID of the service providing group grid prequalification.                                                                                                                                                                                                                                                                                                                                                                                                                                              | bigint<br/>Read only | [service_providing_group_grid_prequalification.id](service_providing_group_grid_prequalification.md#field-id) |
| <a name="field-substation_business_id" href="#field-substation_business_id">substation_business_id</a>                                                                               | Business ID of the substation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | <br/>Read only       |                                                                                                               |
| <a name="field-substation_name" href="#field-substation_name">substation_name</a>                                                                                                    | Name of the substation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | <br/>Read only       |                                                                                                               |
| <a name="field-controllable_unit_count" href="#field-controllable_unit_count">controllable_unit_count</a>                                                                            | Number of controllable units currently in the service providing group at the substation.                                                                                                                                                                                                                                                                                                                                                                                                                  | <br/>Read only       |                                                                                                               |
| <a name="field-maximum_active_power" href="#field-maximum_active_power">maximum_active_power</a>                                                                                     | Sum of the maximum active power of the controllable units currently in the service providing group at the substation, in kW.                                                                                                                                                                                                                                                                                                                                                                              | <br/>Read only       |                                                                                                               |
| <a name="field-total_approved_maximum_active_power" href="#field-total_approved_maximum_active_power">total_approved_maximum_active_power</a>                                        | Total approved flexible power at the substation, in kW. It is the sum of the maximum active power of the controllable units of all service providing groups with an approved or conditionally approved grid prequalification for the same impacted system operator, each controllable unit counted once. Controllable units added to a group after its approval are not included until the changes are approved. Controllable units without a substation are not included. Zero when nothing is approved. | <br/>Read only       |                                                                                                               |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth/authz-model.md#resource-level-authorization-rla)
for the
resource. The default policy is **deny**.

#### Entity

No policies.

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

| Policy key     | Policy                                  | Status |
|----------------|-----------------------------------------|--------|
| SPGGPPPS-FISO001 | Read power per substation for all SPG grid prequalifications. | DONE   |

#### Organisation

No policies.

#### System Operator

| Policy key   | Policy                                                                                                          | Status |
|--------------|-----------------------------------------------------------------------------------------------------------------|--------|
| SPGGPPPS-SO001 | Read power per substation for SPG grid prequalifications where they are the impacted system operator. | DONE   |

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../auth/authn-model.md#party-market-actors).

| FIELD                                            | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|--------------------------------------------------|------|-----|----|----|------|----|----|----|-----|
| service_providing_group_grid_prequalification_id |      |     |    |    | R    | R  |    |    |     |
| substation_business_id                           |      |     |    |    | R    | R  |    |    |     |
| substation_name                                  |      |     |    |    | R    | R  |    |    |     |
| controllable_unit_count                          |      |     |    |    | R    | R  |    |    |     |
| maximum_active_power                             |      |     |    |    | R    | R  |    |    |     |
| total_approved_maximum_active_power              |      |     |    |    | R    | R  |    |    |     |
