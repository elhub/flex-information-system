# Notice

Notice to users about various issues or actions expected from them.

## Context

The following is an overview of notices with description and actions required
from the responsible party.

| Resource                  | Description                                   | Responsible Party | Action required                    |
|---------------------------|-----------------------------------------------|-------------------|------------------------------------|
| CU                        | Grid node ID missing                          | SO                | Update CU with grid node           |
| CU                        | Grid validation status pending                | SO                | Update grid validation status      |
| CU                        | Grid validation status incomplete information | SP                | Update missing information         |
| SP product application    | Status requested                              | SO                | Update application status          |
| SPG membership            | Inconsistency: SPG contains expired CU(s)     | SP                | Validate and update SPG membership |
| SPG product application   | Status requested                              | SO                | Update application status          |
| SPG grid prequalification | Status requested                              | SO                | Update prequalification status     |

## Relevant links

* [API Documentation](/api/v0/#/operations/list_notice)
* [Download docx](/docs/download/notice.docx)

## Fields

| Name                                                         | Description                                     | Format                                                                                                                                                                                                                      | Reference                     |
|--------------------------------------------------------------|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|
| <a name="field-id" href="#field-id">id</a>                   | NON-STABLE unique identifier.                   | bigint<br/>Read only<br/><br/>This identifier is there for uniformity reasons, but it is not tied to an actual notice. Therefore, a notice is not guaranteed to be attached to the same identifier across several requests. |                               |
| <a name="field-party_id" href="#field-party_id">party_id</a> | Reference to the party targeted by the notice.  | bigint<br/>Read only                                                                                                                                                                                                        | [party.id](party.md#field-id) |
| <a name="field-type" href="#field-type">type</a>             | The type of the notice.                         | text<br/>Pattern: `^no.elhub.flex.`<br/>Read only                                                                                                                                                                           |                               |
| <a name="field-source" href="#field-source">source</a>       | The URI of the resource concerned by the event. | text<br/>Pattern: `^(\/([a-z][a-z_]*\|[0-9]+))+$`<br/>Read only                                                                                                                                                             |                               |
| <a name="field-data" href="#field-data">data</a>             | The data of the notice.                         | text<br/>Read only                                                                                                                                                                                                          |                               |

## Validation Rules

### Inter-Field Validation

No validation rules.

### Resource-Level Validation

No validation rules

### Process-Level Validation

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
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

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD    | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|----------|------|-----|----|----|------|----|----|----|----|
| id       |      | R   | R  | R  | R    | R  | R  | R  | R  |
| party_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| type     |      | R   | R  | R  | R    | R  | R  | R  | R  |
| source   |      | R   | R  | R  | R    | R  | R  | R  | R  |
| data     |      | R   | R  | R  | R    | R  | R  | R  | R  |
