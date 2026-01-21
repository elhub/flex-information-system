# Metering Grid Area

Metering grid area accounting points belong to.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_metering_grid_area)
* [Download docx](../download/metering_grid_area.docx)

## Fields

| Name                                                                                 | Description                                                                              | Format                                   | Reference |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|------------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                                           | Unique surrogate identifier.                                                             | bigint<br/>Read only                     |           |
| <a name="field-business_id" href="#field-business_id">business_id</a>                | The business identifier of the metering grid area. Format depends on `business_id_type`. | text<br/>Read only                       |           |
| <a name="field-business_id_type" href="#field-business_id_type">business_id_type</a> | The type of the business identifier.                                                     | text<br/>One of: `eic_y`<br/>Read only   |           |
| <a name="field-name" href="#field-name">name</a>                                     | The name of the metering grid area.                                                      | text<br/>Max length: `128`<br/>Read only |           |

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

| Policy key | Policy        | Status |
|------------|---------------|--------|
| MGA-COM001 | Read all MGA. | DONE   |

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

#### Organisation

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth/auth-model.md#party-market-actors)

| FIELD            | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|------------------|------|-----|----|----|------|----|----|----|----|-----|
| id               |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| business_id      |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| business_id_type |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| name             |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
