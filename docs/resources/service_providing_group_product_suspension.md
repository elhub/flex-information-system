# Service Providing Group Product Suspension

The relation allowing a procuring system operator to temporarily suspend a
service providing group from delivering products of certain types.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_service_providing_group_product_suspension)
* [Download docx](../download/service_providing_group_product_suspension.docx)

## Fields

| Name                                                                                                                     | Description                                                                        | Format                                                                                   | Reference                                                         |
|--------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                               | Unique surrogate identifier.                                                       | bigint<br/>Read only                                                                     |                                                                   |
| <a name="field-procuring_system_operator_id" href="#field-procuring_system_operator_id">procuring_system_operator_id</a> | Reference to the procuring system operator suspending the service providing group. | bigint<br/>Non-updatable<br/><br/>Defaults to the system operator creating the resource. | [party.id](party.md#field-id)                                     |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a>       | Reference to the service providing group being suspended.                          | bigint<br/>Required<br/>Non-updatable                                                    | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-product_type_ids" href="#field-product_type_ids">product_type_ids</a>                                     | References to the suspended product types.                                         | <br/>Required<br/>Array of bigint                                                        | [product_type.id](product_type.md#field-id)                       |
| <a name="field-reason" href="#field-reason">reason</a>                                                                   | The reason for the suspension.                                                     | text<br/>One of: `failed_verification`, `other`<br/>Required                             |                                                                   |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                    | When the resource was recorded (created or updated) in the system.                 | timestamp with time zone<br/>Read only                                                   |                                                                   |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                    | The identity that recorded the resource.                                           | bigint<br/>Read only                                                                     |                                                                   |

## Validation Rules

| Validation rule key | Validation rule                                                                           | Status |
|---------------------|-------------------------------------------------------------------------------------------|--------|
| SPGPS-VAL001        | Suspended `product_type_ids` must be product types that the SO has qualified the SPG for. | DONE   |

## Notifications

| Action                 | Recipient | Comment                                                    |
|------------------------|-----------|------------------------------------------------------------|
| create, update, delete | SP        | Suspended SP                                               |
| create, update, delete | SO        | All PSOs procuring the same product type from the same SPG |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
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

| Policy key    | Policy                                     | Status |
|---------------|--------------------------------------------|--------|
| SPGPS-FISO001 | Create, read, update and delete all SPGPS. | DONE   |
| SPGPS-FISO002 | Read all SPGPS history.                    | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                                                                           | Status |
|-------------|--------------------------------------------------------------------------------------------------|--------|
| SPGPS-SO001 | Create, read, update and delete their own SPGPS.                                                 | DONE   |
| SPGPS-SO002 | Read history on their own SPGPS.                                                                 | DONE   |
| SPGPS-SO003 | Read SPGPS targeted at SPGs they have qualified for at least one of the product types.           | DONE   |
| SPGPS-SO004 | Read history on SPGPS targeted at SPGs they had qualified for at least one of the product types. | DONE   |

#### Service Provider

| Policy key  | Policy                                      | Status |
|-------------|---------------------------------------------|--------|
| SPGPS-SP001 | Read SPGPS targeting their SPGs.            | DONE   |
| SPGPS-SP002 | Read history on SPGPS targeting their SPGs. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD                        | ANON | BRP | ES | EU | FISO | MO | SO  | SP | TP | ORG |
|------------------------------|------|-----|----|----|------|----|-----|----|----|-----|
| id                           |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| procuring_system_operator_id |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| service_providing_group_id   |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| product_type_ids             |      | R   | R  | R  | RC   | R  | RC  | R  | R  |     |
| reason                       |      | R   | R  | R  | RCU  | R  | RCU | R  | R  |     |
| recorded_at                  |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
| recorded_by                  |      | R   | R  | R  | R    | R  | R   | R  | R  |     |
