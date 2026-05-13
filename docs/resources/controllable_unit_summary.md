# Controllable Unit Summary

Aggregated summary of technical resources belonging to a controllable unit.

## Relevant links

* [API Documentation](../api/v1/index.html#/operations/read_controllable_unit_summary)
* [Download docx](../download/controllable_unit_summary.docx)

## Fields

| Name                                                                                             | Description                                                                                                                                                                                | Format                    | Reference                                             |
|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                       | Unique surrogate key (controllable unit ID).                                                                                                                                               | bigint<br/>Read only      |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a> | The ID of the controllable unit this resource is a summary of.                                                                                                                             | bigint<br/>Read only      | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-technical_resource" href="#field-technical_resource">technical_resource</a>       | Aggregated statistics on technical resources belonging to the controllable unit, including counts and maximum active power breakdowns (sum, average, min, max) by category and technology. | <br/>Object<br/>Read only |                                                       |

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

| FIELD                | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|----------------------|------|-----|----|----|------|----|----|----|-----|
| id                   |      | R   | R  | R  | R    | R  | R  | R  |     |
| controllable_unit_id |      | R   | R  | R  | R    | R  | R  | R  |     |
| technical_resource   |      | R   | R  | R  | R    | R  | R  | R  |     |
