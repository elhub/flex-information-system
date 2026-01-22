# Accounting Point End User

Relation telling which end user an accounting point belongs to.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_accounting_point_end_user)
* [Download docx](../download/accounting_point_end_user.docx)

## Fields

| Name                                                                                          | Description                                                                                                | Format                                 | Reference                                           |
|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------|
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a> | The ID of the accounting point.                                                                            | bigint<br/>Read only                   | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-end_user_id" href="#field-end_user_id">end_user_id</a>                         | The end user on the accounting point.                                                                      | bigint<br/>Read only                   | [party.id](party.md#field-id)                       |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                            | The date from which the accounting point belongs to the end user. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                  | The date until which the accounting point belongs to the end user. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only |                                                     |

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
| APEU-FISO001  | Read all APEU. | DONE   |

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
| end_user_id         |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_from          |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| valid_to            |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
