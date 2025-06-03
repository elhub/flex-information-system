# Accounting Point Energy Supplier

Relation linking an energy supplier to an accounting point.

Data from Elhub.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_accounting_point_energy_supplier)
* [Download docx](/docs/download/accounting_point_energy_supplier.docx)

## Fields

| Name                                                                                          | Description                                                                                                                              | Format                                 | Reference                                           |
|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------|
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a> | The ID of the accounting point.                                                                                                          | bigint<br/>Read only                   | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-energy_supplier_id" href="#field-energy_supplier_id">energy_supplier_id</a>    | The energy supplier of the accounting point.                                                                                             | bigint<br/>Read only                   | [party.id](party.md#field-id)                       |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                            | The date from which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                  | The date until which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only |                                                     |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
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

| Policy key    | Policy         | Status |
|---------------|----------------|--------|
| APES-FISO001  | Read all APES. | DONE   |

#### Market Operator

No policies.

#### System Operator

| Policy key | Policy                                             | Status |
|------------|----------------------------------------------------|--------|
| APES-SO001 | Read APES when they are system operator on the AP. | DONE   |

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party)

| FIELD               | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|---------------------|------|-----|----|----|------|----|----|----|----|
| accounting_point_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| energy_supplier_id  |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_from          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_to            |      | R   | R  | R  | R    | R  | R  | R  | R  |
