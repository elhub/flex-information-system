# Accounting Point

A metering point where the consumption or production of electricity is measured
and settled.

Provides a way for parties to identify the system operator of the accounting point.

Data from Elhub.

## Business Identifiers

The business identifier is the GSRN metering point id.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_accounting_point)
* [Download docx](/docs/download/accounting_point.docx)

## Fields

| Name                                                                                       | Description                                                        | Format                                             | Reference                     |
|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------|----------------------------------------------------|-------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                 | Unique surrogate identifier.                                       | bigint<br/>Read only                               |                               |
| <a name="field-business_id" href="#field-business_id">business_id</a>                      | The GSRN metering point id of the accounting point.                | text<br/>Pattern: `^[1-9][0-9]{17}$`<br/>Read only |                               |
| <a name="field-system_operator_id" href="#field-system_operator_id">system_operator_id</a> | The system operator of the accounting point.                       | bigint<br/>Read only                               | [party.id](party.md#field-id) |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                      | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only             |                               |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                      | The identity that recorded the resource.                           | bigint<br/>Read only                               |                               |

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

| Policy key | Policy                      | Status |
|------------|-----------------------------|--------|
| AP-COM001  | Read all accounting points. | DONE   |

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

For party type abbreviations, check [the auth docs](../technical/auth.md#party)

| FIELD              | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|--------------------|------|-----|----|----|------|----|----|----|----|
| id                 |      | R   | R  | R  | R    | R  | R  | R  | R  |
| business_id        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| system_operator_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_at        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by        |      | R   | R  | R  | R    | R  | R  | R  | R  |
