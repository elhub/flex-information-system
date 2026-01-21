# Accounting Point Balance Responsible Party

Relation linking a balance responsible party to an accounting point.

Data from Elhub.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_accounting_point_balance_responsible_party)
* [Download docx](../download/accounting_point_balance_responsible_party.docx)

## Fields

| Name                                                                                                                     | Description                                                                                                                                        | Format                                                     | Reference                                           |
|--------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------|-----------------------------------------------------|
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a>                            | The ID of the accounting point.                                                                                                                    | bigint<br/>Read only                                       | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-balance_responsible_party_id" href="#field-balance_responsible_party_id">balance_responsible_party_id</a> | The balance responsible party of the accounting point.                                                                                             | bigint<br/>Read only                                       | [party.id](party.md#field-id)                       |
| <a name="field-energy_direction" href="#field-energy_direction">energy_direction</a>                                     | The direction of the effect on the balance that the BRP takes responsibility for.                                                                  | text<br/>One of: `consumption`, `production`<br/>Read only |                                                     |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                                                       | The date from which the relation between the accounting point and the balance responsible party is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only                     |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                                             | The date until which the relation between the accounting point and the balance responsible party is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only                     |                                                     |

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

No policies.

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key     | Policy          | Status |
|----------------|-----------------|--------|
| APBRP-FISO001  | Read all APBRP. | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                              | Status |
|-------------|-----------------------------------------------------|--------|
| APBRP-SO001 | Read APBRP when they are system operator on the AP. | DONE   |

#### Service Provider

| Policy key  | Policy                                                          | Status |
|-------------|-----------------------------------------------------------------|--------|
| APBRP-SP001 | Read APBRP on periods where they are related to a CU on the AP. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth/auth-model.md#party-market-actors)

| FIELD                        | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|------------------------------|------|-----|----|----|------|----|----|----|----|-----|
| accounting_point_id          |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| balance_responsible_party_id |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| energy_direction             |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_from                   |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_to                     |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
