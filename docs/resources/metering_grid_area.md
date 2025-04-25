# Metering grid area

Metering grid area owned by a system operator.

Data from Elhub.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_metering_grid_area)
* [Download docx](/docs/download/metering_grid_area.docx)

## Fields

| Name                                                                                       | Description                                                                                   | Format                                                             | Reference                     |
|--------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|--------------------------------------------------------------------|-------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                 | Unique surrogate identifier.                                                                  | bigint<br/>Read only                                               |                               |
| <a name="field-business_id" href="#field-business_id">business_id</a>                      | The EIC-X ID of the metering grid area.                                                       | text<br/>Pattern: `^[0-9]{2}X[0-9A-Z-]{12}[0-9A-Z]$`<br/>Read only |                               |
| <a name="field-name" href="#field-name">name</a>                                           | The name of the metering grid area.                                                           | text<br/>Read only                                                 |                               |
| <a name="field-price_area" href="#field-price_area">price_area</a>                         | The price area the MGA belongs to.                                                            | text<br/>One of: `NO1`, `NO2`, `NO3`, `NO4`, `NO5`<br/>Read only   |                               |
| <a name="field-system_operator_id" href="#field-system_operator_id">system_operator_id</a> | The system operator that owns the metering grid area.                                         | bigint<br/>Read only                                               | [party.id](party.md#field-id) |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                         | The date from which the metering grid area is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone                                           |                               |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                               | The date until which the metering grid area is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone                                           |                               |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                      | When the resource was recorded (created or updated) in the system.                            | timestamp with time zone<br/>Read only                             |                               |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                      | The identity that recorded the resource.                                                      | bigint<br/>Read only                                               |                               |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Entity

No policies.

#### Anonymous

No policies.

#### Common

| Policy key | Policy                        | Status |
|------------|-------------------------------|--------|
| MGA-COM001 | Read all metering grid areas. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

No policies.

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

| FIELD              | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|--------------------|------|-----|----|----|------|----|----|----|----|
| id                 |      | R   | R  | R  | R    | R  | R  | R  | R  |
| business_id        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| name               |      | R   | R  | R  | R    | R  | R  | R  | R  |
| price_area         |      | R   | R  | R  | R    | R  | R  | R  | R  |
| system_operator_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_from         |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_to           |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_at        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by        |      | R   | R  | R  | R    | R  | R  | R  | R  |
