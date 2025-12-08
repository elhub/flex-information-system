# System Operator Product Type

The relation that links a system operator to a type of product they want to buy
on a flexibility market. The system operator creates one resource for each
product type they ask for.

## Status transitions for system operator product type

The system operator can ask for a product type temporarily or periodically.
The `status` field on the resource is there to give this information. A system
operator product type resource always starts as `active`, but it can be marked
`inactive` when the system operator does not need the product.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_system_operator_product_type)
* [Download docx](../download/system_operator_product_type.docx)

## Fields

| Name                                                                                       | Description                                                        | Format                                                      | Reference                                   |
|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                 | Unique surrogate identifier.                                       | bigint<br/>Read only                                        |                                             |
| <a name="field-system_operator_id" href="#field-system_operator_id">system_operator_id</a> | Reference to the system operator.                                  | bigint<br/>Required<br/>Non-updatable                       | [party.id](party.md#field-id)               |
| <a name="field-product_type_id" href="#field-product_type_id">product_type_id</a>          | Reference to the product type.                                     | bigint<br/>Required<br/>Non-updatable                       | [product_type.id](product_type.md#field-id) |
| <a name="field-status" href="#field-status">status</a>                                     | The status of the relation.                                        | text<br/>One of: `active`, `inactive`<br/>Default: `active` |                                             |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                      | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only                      |                                             |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                      | The identity that recorded the resource.                           | bigint<br/>Read only                                        |                                             |

## Validation Rules

No validation rules.

## Notifications

| Action | Recipient                  | Comment |
|--------|----------------------------|---------|
| create | All active SPs, SO on SOPT |         |
| update | SO on SOPT                 |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key  | Policy                                   | Status |
|-------------|------------------------------------------|--------|
| SOPT-COM001 | Read history on SOPT that they can read. | DONE   |
| SOPT-COM002 | Read all SOPT.                           | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key   | Policy                            | Status |
|--------------|-----------------------------------|--------|
| SOPT-FISO001 | Read, create and update all SOPT. | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                              | Status |
|------------|-----------------------------------------------------|--------|
| SOPT-SO001 | Read, create and update SOPT concerning themselves. | DONE   |

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD              | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|--------------------|------|-----|----|----|------|----|----|----|----|-----|
| id                 |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| system_operator_id |      | R   | R  | R  | RC   | R  | RC | R  | R  |     |
| product_type_id    |      | R   | R  | R  | RC   | R  | RC | R  | R  |     |
| status             |      | R   | R  | R  | RU   | R  | RU | R  | R  |     |
| recorded_at        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| recorded_by        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
