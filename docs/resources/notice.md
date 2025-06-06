# Notice

Notice to users about various issues or actions expected from them.

## Context

The following is an overview of notices with description and actions required
from the responsible party.

| Type                                                                          | Description                                                     | Responsible Party | Action required                                                                                   |
|-------------------------------------------------------------------------------|-----------------------------------------------------------------|-------------------|---------------------------------------------------------------------------------------------------|
| no.elhub.flex.controllable_unit.grid_node_id.missing                          | Grid node ID missing                                            | CSO               | Update CU with grid node                                                                          |
| no.elhub.flex.controllable_unit.grid_validation_status.pending                | Grid validation status pending                                  | CSO               | Verify CU for grid verification and update status                                                 |
| no.elhub.flex.controllable_unit.grid_validation_status.incomplete_information | Grid validation status incomplete information                   | SP                | Update missing information                                                                        |
| no.elhub.flex.service_provider_product_application.status.requested           | SP product application status requested                         | PSO               | Initiate SP product qualification and update status                                               |
| no.elhub.flex.service_providing_group_membership.valid_time.outside_contract  | Inconsistency: SPG contains expired CU(s)                       | SP                | Validate and update SPG membership                                                                |
| no.elhub.flex.service_providing_group_product_application.status.requested    | SPG product application status requested                        | PSO               | Initiate SPG product prequalification and update status                                           |
| no.elhub.flex.service_providing_group_grid_prequalification.status.requested  | SPG grid prequalification status requested                      | ISO               | Initiate SPG grid prequalification and update status                                              |
| no.elhub.flex.service_providing_group.balance_responsible_party.multiple      | Inconsistency: Multiple BRPs in a single SPG                    | SP                | Make sure the SPG only contains CU currently associated to the same BRP on their accounting point |
| no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract  | Inconsistency: CUSP valid while end user is not valid on the AP | SP                | Update CUSP to match the updated end user data from Elhub                                         |

## Relevant links

* [API Documentation](https://elhub.github.io/flex-information-system/api/v0/#/operations/list_notice)
* [Download docx](../download/notice.docx)

## Fields

| Name                                                         | Description                                     | Format                                                          | Reference                     |
|--------------------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------|-------------------------------|
| <a name="field-party_id" href="#field-party_id">party_id</a> | Reference to the party targeted by the notice.  | bigint<br/>Read only                                            | [party.id](party.md#field-id) |
| <a name="field-type" href="#field-type">type</a>             | The type of the notice.                         | text<br/>Pattern: `^no.elhub.flex.`<br/>Read only               |                               |
| <a name="field-source" href="#field-source">source</a>       | The URI of the resource concerned by the event. | text<br/>Pattern: `^(\/([a-z][a-z_]*\|[0-9]+))+$`<br/>Read only |                               |
| <a name="field-data" href="#field-data">data</a>             | The data of the notice.                         | text<br/>Read only                                              |                               |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

No policies.

#### Common

| Policy key    | Policy                         | Status |
|---------------|--------------------------------|--------|
| NOTICE-COM001 | Read notices targeted to them. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key     | Policy            | Status |
|----------------|-------------------|--------|
| NOTICE-FISO001 | Read all notices. | DONE   |

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD    | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|----------|------|-----|----|----|------|----|----|----|----|
| party_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| type     |      | R   | R  | R  | R    | R  | R  | R  | R  |
| source   |      | R   | R  | R  | R    | R  | R  | R  | R  |
| data     |      | R   | R  | R  | R    | R  | R  | R  | R  |
