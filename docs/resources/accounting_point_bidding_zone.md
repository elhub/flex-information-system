# Accounting Point Bidding Zone

Relation telling which bidding zone an accounting point belongs to.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_accounting_point_bidding_zone)
* [Download docx](../download/accounting_point_bidding_zone.docx)

## Fields

| Name                                                                                          | Description                                                                                                    | Format                                                          | Reference                                           |
|-----------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|-----------------------------------------------------|
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a> | The ID of the accounting point.                                                                                | bigint<br/>Read only                                            | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-bidding_zone" href="#field-bidding_zone">bidding_zone</a>                      | The bidding zone of the accounting point.                                                                      | text<br/>One of: `NO1`, `NO2`, `NO3`, `NO4`, `NO5`<br/>Required |                                                     |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                            | The date from which the accounting point belongs to the bidding zone. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only                          |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                  | The date until which the accounting point belongs to the bidding zone. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only                          |                                                     |

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

| Policy key    | Policy         | Status |
|---------------|----------------|--------|
| APBZ-FISO001  | Read all APBZ. | DONE   |

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

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD               | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|---------------------|------|-----|----|----|------|----|----|----|----|-----|
| accounting_point_id |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| bidding_zone        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_from          |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_to            |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
