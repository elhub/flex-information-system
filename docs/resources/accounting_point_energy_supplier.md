# Accounting point energy supplier

Relation linking an energy supplier to an accounting point.

Data from Elhub.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_accounting_point_energy_supplier)
* [Download docx](/docs/download/accounting_point_energy_supplier.docx)

## Fields

| Name                                                                                          | Description                                                                                                                              | Format                                 | Reference                                           |
|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                    | Unique surrogate identifier.                                                                                                             | bigint<br/>Read only                   |                                                     |
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a> | The ID of the accounting point.                                                                                                          | bigint<br/>Read only                   | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-energy_supplier_id" href="#field-energy_supplier_id">energy_supplier_id</a>    | The energy supplier of the accounting point.                                                                                             | bigint<br/>Read only                   | [party.id](party.md#field-id)                       |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                            | The date from which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                  | The date until which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                         | When the resource was recorded (created or updated) in the system.                                                                       | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                         | The identity that recorded the resource.                                                                                                 | bigint<br/>Read only                   |                                                     |

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

No policies.

#### Balance Responsible Party

| Policy key  | Policy                                             | Status |
|-------------|----------------------------------------------------|--------|
| APES-BRP001 | Read APES on periods where they are BRP on the AP. | TODO   |

#### End User

No policies.

#### Energy Supplier

| Policy key | Policy                                       | Status |
|------------|----------------------------------------------|--------|
| APES-ES001 | Read APES when they are the energy supplier. | TODO   |

#### Flexibility Information System Operator

| Policy key   | Policy         | Status |
|--------------|----------------|--------|
| APES-FISO001 | Read all APES. | TODO   |

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

| Policy key | Policy                                                         | Status |
|------------|----------------------------------------------------------------|--------|
| APES-SP001 | Read APES on periods where they are related to a CU on the AP. | TODO   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD               | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|---------------------|------|-----|----|----|------|----|----|----|----|
| id                  |      | R   | R  | R  | R    | R  | R  | R  | R  |
| accounting_point_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| energy_supplier_id  |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_from          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_to            |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_at         |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by         |      | R   | R  | R  | R    | R  | R  | R  | R  |
