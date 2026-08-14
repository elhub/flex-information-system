# Service Providing Group Summary

Aggregated summary of controllable units and technical resources belonging to a service providing group.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/read_service_providing_group_summary)
* [Download docx](../download/service_providing_group_summary.docx)

## Fields

| Name                                                                                                               | Description                                                                                                                                                                                                                                   | Format                    | Reference                                                         |
|--------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                         | Unique surrogate key (service providing group ID).                                                                                                                                                                                            | bigint<br/>Read only      |                                                                   |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a> | The ID of the service providing group this resource is a summary of.                                                                                                                                                                          | bigint<br/>Read only      | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-controllable_unit" href="#field-controllable_unit">controllable_unit</a>                            | Aggregated statistics on controllable units currently in the service providing group, including count and maximum active power information (sum, average, min, max).                                                                          | <br/>Object<br/>Read only |                                                                   |
| <a name="field-technical_resource" href="#field-technical_resource">technical_resource</a>                         | Aggregated statistics on technical resources belonging to controllable units with active membership in the service providing group, including counts and maximum active power breakdowns (sum, average, min, max) by category and technology. | <br/>Object<br/>Read only |                                                                   |

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

| Policy key   | Policy                                | Status |
|--------------|---------------------------------------|--------|
| SPGSU-COM001 | Read summaries for SPGs they can see. | DONE   |

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
[the authentication docs](../auth/authn-model.md#party-market-actors).

| FIELD                      | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|----------------------------|------|-----|----|----|------|----|----|----|-----|
| id                         |      | R   | R  | R  | R    | R  | R  | R  |     |
| service_providing_group_id |      | R   | R  | R  | R    | R  | R  | R  |     |
| controllable_unit          |      | R   | R  | R  | R    | R  | R  | R  |     |
| technical_resource         |      | R   | R  | R  | R    | R  | R  | R  |     |
