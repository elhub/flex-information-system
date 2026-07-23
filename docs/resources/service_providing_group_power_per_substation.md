# Service Providing Group Power Per Substation

Per-substation breakdown of controllable units and their technical details for a
service providing group.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/read_service_providing_group_power_per_substation)
* [Download docx](../download/service_providing_group_power_per_substation.docx)

## Fields

| Name                                                                                                               | Description                                                                                                                                                                                                                                                                                                                                                                              | Format                   | Reference                                                         |
|--------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                         | Unique surrogate key (service providing group ID).                                                                                                                                                                                                                                                                                                                                       | bigint<br/>Read only     |                                                                   |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a> | The ID of the service providing group this resource is a breakdown of.                                                                                                                                                                                                                                                                                                                   | bigint<br/>Read only     | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-substations" href="#field-substations">substations</a>                                              | List of per-substation aggregates for the controllable units currently in the service providing group. Each element contains the substation identifier and name, plus count and maximum active power statistics for the controllable units connected to that substation. An element with null substation fields groups controllable units whose grid location has not yet been assigned. | <br/>Array<br/>Read only |                                                                   |

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

| Policy key    | Policy                                                | Status |
|---------------|-------------------------------------------------------|--------|
| SPGPPS-COM001 | Read power per substation for SPGs they can see.      | DONE   |

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
| substations                |      | R   | R  | R  | R    | R  | R  | R  |     |
