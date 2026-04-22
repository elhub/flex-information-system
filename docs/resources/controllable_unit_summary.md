# Controllable Unit Summary

Aggregated summary of technical resources belonging to a controllable unit.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/read_controllable_unit_summary)
* [Download docx](../download/controllable_unit_summary.docx)

## Fields

| Name                                                                                                                                                      | Description                                                                                                                    | Format                | Reference                                             |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-----------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                                                                | The ID of the controllable unit this resource is a summary of.                                                                 | bigint<br/>Read only  | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-count_technical_resource" href="#field-count_technical_resource">count_technical_resource</a>                                              | Total number of technical resources in the controllable unit.                                                                  | bigint<br/>Read only  |                                                       |
| <a name="field-count_technical_resource_by_technology" href="#field-count_technical_resource_by_technology">count_technical_resource_by_technology</a>    | Number of technical resources in the controllable unit, broken down by technology. Keys are technology IDs, values are counts. | <br/>Read only        |                                                       |
| <a name="field-sum_maximum_active_power" href="#field-sum_maximum_active_power">sum_maximum_active_power</a>                                              | Sum of maximum active power of all technical resources in the controllable unit.                                               | decimal<br/>Read only |                                                       |
| <a name="field-sum_maximum_active_power_production" href="#field-sum_maximum_active_power_production">sum_maximum_active_power_production</a>             | Sum of maximum active power of all production technical resources in the controllable unit.                                    | decimal<br/>Read only |                                                       |
| <a name="field-sum_maximum_active_power_consumption" href="#field-sum_maximum_active_power_consumption">sum_maximum_active_power_consumption</a>          | Sum of maximum active power of all consumption technical resources in the controllable unit.                                   | decimal<br/>Read only |                                                       |
| <a name="field-sum_maximum_active_power_energy_storage" href="#field-sum_maximum_active_power_energy_storage">sum_maximum_active_power_energy_storage</a> | Sum of maximum active power of all energy storage technical resources in the controllable unit.                                | decimal<br/>Read only |                                                       |
| <a name="field-average_maximum_active_power" href="#field-average_maximum_active_power">average_maximum_active_power</a>                                  | Average maximum active power across all technical resources in the controllable unit.                                          | decimal<br/>Read only |                                                       |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
resource. The default policy is **deny**.

#### Entity

No policies.

#### Anonymous

No policies.

#### Common

| Policy key  | Policy                               | Status |
|-------------|--------------------------------------|--------|
| CUSU-COM001 | Read summaries for CUs they can see. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

No policies.

#### Organisation

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD                                   | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|-----------------------------------------|------|-----|----|----|------|----|----|----|-----|
| id                                      |      | R   | R  | R  | R    | R  | R  | R  |     |
| count_technical_resource                |      | R   | R  | R  | R    | R  | R  | R  |     |
| count_technical_resource_by_technology  |      | R   | R  | R  | R    | R  | R  | R  |     |
| sum_maximum_active_power                |      | R   | R  | R  | R    | R  | R  | R  |     |
| sum_maximum_active_power_production     |      | R   | R  | R  | R    | R  | R  | R  |     |
| sum_maximum_active_power_consumption    |      | R   | R  | R  | R    | R  | R  | R  |     |
| sum_maximum_active_power_energy_storage |      | R   | R  | R  | R    | R  | R  | R  |     |
| average_maximum_active_power            |      | R   | R  | R  | R    | R  | R  | R  |     |
