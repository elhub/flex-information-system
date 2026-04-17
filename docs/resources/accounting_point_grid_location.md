# Accounting Point Grid Location

The electrical (topological) location of an accounting point in the common grid
model ([Nemo](https://nemo.elbits.no/modell/)). Since a controllable unit is
always behind an accounting point, this also gives the grid location for all
controllable units connected to that accounting point.

The connecting system operator (CSO) is responsible for registering and
maintaining the grid location. Another system operator may also register a grid
location, but only when the current entry is missing or has been set by the
system or guessed by another system operator. The system will automatically
guess the grid location based on the geographical location of the accounting
point when no authoritative location is available.

For more information about how grid location works and the data model behind it,
see [Accounting Point Grid Location](../technical/accounting-point-grid-location.md).

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_accounting_point_grid_location)
* [Download docx](../download/accounting_point_grid_location.docx)

## Fields

| Name                                                                                                   | Description                                                                  | Format                                                                                    | Reference                                           |
|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|-----------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                             | Unique surrogate key.                                                        | bigint<br/>Read only                                                                      |                                                     |
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a>          | The accounting point this grid location belongs to.                          | bigint<br/>Required<br/>Non-updatable                                                     | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-object_type" href="#field-object_type">object_type</a>                                  | The type of object in the common grid model that the accounting point is at. | text<br/>One of: `substation`, `transformer`<br/>Required                                 |                                                     |
| <a name="field-business_id" href="#field-business_id">business_id</a>                                  | Business identifier (mRID) referencing the object in the common grid model.  | text<br/>Pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` |                                                     |
| <a name="field-name" href="#field-name">name</a>                                                       | Name of the grid model object at the location.                               | text<br/>Required<br/>Max length: `512`                                                   |                                                     |
| <a name="field-nominal_voltage" href="#field-nominal_voltage">nominal_voltage</a>                      | Nominal voltage level at the grid location, in kilovolt (kV).                | decimal<br/>Required<br/>Min: `0`                                                         |                                                     |
| <a name="field-additional_information" href="#field-additional_information">additional_information</a> | Free text field for extra information about the grid location if needed.     | text                                                                                      |                                                     |
| <a name="field-source" href="#field-source">source</a>                                                 | How the grid location was determined.                                        | text<br/>One of: `cso`, `so`, `grid_model`, `system`<br/>Required                         |                                                     |
| <a name="field-quality" href="#field-quality">quality</a>                                              | The quality of the grid location registration.                               | text<br/>One of: `confirmed`, `guessed`<br/>Required                                      |                                                     |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                  | When the resource was recorded (created or updated) in the system.           | date-time<br/>Read only                                                                   |                                                     |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                  | The identity that recorded the resource.                                     | bigint<br/>Read only                                                                      |                                                     |

## Validation Rules

| Validation rule key | Validation rule                                                                                                             | Status |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------|--------|
| APGL-VAL001         | Updates to the grid location are only allowed based on the current `source` value. See transition table below.              | TODO   |
| APGL-VAL002         | `quality=confirmed` is only permitted when `source` is `cso` or `grid_model`. All other sources must use `quality=guessed`. | TODO   |

### APGL-VAL001 source transition table

The table shows which new `source` values are permitted given the current value
of the record. `yes` means the transition is allowed, `no` means it is denied.

| Current ↓ \ New → | `grid_model` | `cso` | `so`                                          | `system` |
|-------------------|--------------|-------|-----------------------------------------------|----------|
| `grid_model`      | yes          | no    | no                                            | no       |
| `cso`             | yes          | yes   | no                                            | no       |
| `so`              | yes          | yes   | yes, but not transition `confirmed`→`guessed` | no       |
| `system`          | yes          | yes   | yes                                           | yes      |
| missing           | yes          | yes   | yes                                           | yes      |

## Notifications

No notifications.

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

| Policy key   | Policy                                                       | Status |
|--------------|--------------------------------------------------------------|--------|
| APGL-FISO001 | Read, create and update all accounting point grid locations. | TODO   |
| APGL-FISO002 | Read all accounting point grid location history.             | TODO   |

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                                                                      | Status |
|------------|---------------------------------------------------------------------------------------------|--------|
| APGL-SO001 | Read accounting point grid locations where they are SO                                      | TODO   |
| APGL-SO002 | Create and update accounting point grid locations where they are SO, subject to APGL-VAL001 | TODO   |
| APGL-SO003 | Read history on accounting point grid locations                                             | TODO   |

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD                  | ANON | BRP | ES | EU | FISO | SO  | SP | TP | ORG |
|------------------------|------|-----|----|----|------|-----|----|----|-----|
| id                     |      |     |    |    | R    | R   |    |    |     |
| accounting_point_id    |      |     |    |    | RC   | RC  |    |    |     |
| object_type            |      |     |    |    | RCU  | RCU |    |    |     |
| business_id            |      |     |    |    | RCU  | RCU |    |    |     |
| name                   |      |     |    |    | RCU  | RCU |    |    |     |
| nominal_voltage        |      |     |    |    | RCU  | RCU |    |    |     |
| additional_information |      |     |    |    | RCU  | RCU |    |    |     |
| source                 |      |     |    |    | RCU  | RCU |    |    |     |
| quality                |      |     |    |    | RCU  | RCU |    |    |     |
| recorded_at            |      |     |    |    | R    | R   |    |    |     |
| recorded_by            |      |     |    |    | R    | R   |    |    |     |
