# Service Provider Product Suspension

The relation allowing a procuring system operator to temporarily suspend a
service provider from delivering them products of the given types.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_provider_product_suspension)
* [Download docx](../download/service_provider_product_suspension.docx)

## Fields

| Name                                                                                                                     | Description                                                                 | Format                                                                                                                                         | Reference                                   |
|--------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                               | Unique surrogate identifier.                                                | bigint<br/>Read only                                                                                                                           |                                             |
| <a name="field-procuring_system_operator_id" href="#field-procuring_system_operator_id">procuring_system_operator_id</a> | Reference to the procuring system operator suspending the service provider. | bigint<br/>Non-updatable<br/><br/>Defaults to the system operator creating the resource.                                                       | [party.id](party.md#field-id)               |
| <a name="field-service_provider_id" href="#field-service_provider_id">service_provider_id</a>                            | Reference to the service provider being suspended.                          | bigint<br/>Required<br/>Non-updatable                                                                                                          | [party.id](party.md#field-id)               |
| <a name="field-product_type_ids" href="#field-product_type_ids">product_type_ids</a>                                     | References to the suspended product types.                                  | <br/>Required<br/>Array of bigint                                                                                                              | [product_type.id](product_type.md#field-id) |
| <a name="field-reason" href="#field-reason">reason</a>                                                                   | The reason for the suspension.                                              | text<br/>One of: `communication_issues`, `failing_heartbeat`, `system_issues`, `clearing_issues`, `breach_of_conditions`, `other`<br/>Required |                                             |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                    | When the resource was recorded (created or updated) in the system.          | timestamp with time zone<br/>Read only                                                                                                         |                                             |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                    | The identity that recorded the resource.                                    | bigint<br/>Read only                                                                                                                           |                                             |

## Validation Rules

| Validation rule key | Validation rule                                                                          | Status |
|---------------------|------------------------------------------------------------------------------------------|--------|
| SPPS-VAL001         | Suspended `product_type_ids` must be product types that the SO has qualified the SP for. | DONE   |

## Notifications

| Action                 | Recipient | Comment                                                   |
|------------------------|-----------|-----------------------------------------------------------|
| create, update, delete | SP        | Suspended SP                                              |
| create, update, delete | SO        | All PSOs procuring the same product type from the same SP |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz.md#resource-level-authorization-rla)
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

| Policy key   | Policy                                    | Status |
|--------------|-------------------------------------------|--------|
| SPPS-FISO001 | Create, read, update and delete all SPPS. | DONE   |
| SPPS-FISO002 | Read all SPPS history.                    | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                                                                            | Status |
|------------|---------------------------------------------------------------------------------------------------|--------|
| SPPS-SO001 | Create, read, update and delete their own SPPS.                                                   | DONE   |
| SPPS-SO002 | Read history on their own SPPS.                                                                   | DONE   |
| SPPS-SO003 | Read SPPS targeted at any SP they have qualified for at least one of the product types.           | DONE   |
| SPPS-SO004 | Read history on SPPS targeted at any SP they had qualified for at least one of the product types. | DONE   |

#### Service Provider

| Policy key | Policy                               | Status |
|------------|--------------------------------------|--------|
| SPPS-SP001 | Read SPPS targeting them.            | DONE   |
| SPPS-SP002 | Read history on SPPS targeting them. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth/auth-model.md#party-market-actors)

| FIELD                        | ANON | BRP | ES | EU | FISO | MO | SO  | SP | TP | ORG |
|------------------------------|------|-----|----|----|------|----|-----|----|----|-----|
| id                           |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| procuring_system_operator_id |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| service_provider_id          |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| product_type_ids             |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
| reason                       |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
| recorded_at                  |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| recorded_by                  |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
