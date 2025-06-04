# Service Providing Group Product Application

Relation uniquely linking a service providing group and a system operator for a
product type, for the SPG to deliver a product to the SO later.

## Application status transitions

The following diagram shows the status transitions for service providing group
applications. This resource supports the application process and is updated as
it progresses.

The service provider is responsible for creating a new SPG product application.
Initially, the status is set to `requested`. The system operator then takes over
until the application is either `prequalified`, `verified` or `rejected`. If it
rejected, the service provider can make updates and propose the application
again.

[Full Size](../diagrams/service_providing_group_product_application_status.png)
|
[Graphviz description](../diagrams/service_providing_group_product_application_status.plantuml)
|
[How to read the diagram](./index.md#status-and-transitions)

![Service provider product application status transitions](../diagrams/service_providing_group_product_application_status.png)

## Relevant links

* [API Documentation](https://flex-test.elhub.no/api/v0/#/operations/list_service_providing_group_product_application)
* [Download docx](../download/service_providing_group_product_application.docx)

## Fields

| Name                                                                                                                     | Description                                                        | Format                                                                                                                                                          | Reference                                                         |
|--------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                               | Unique surrogate identifier.                                       | bigint<br/>Read only                                                                                                                                            |                                                                   |
| <a name="field-service_providing_group_id" href="#field-service_providing_group_id">service_providing_group_id</a>       | Reference to the service providing group.                          | bigint<br/>Required<br/>Non-updatable                                                                                                                           | [service_providing_group.id](service_providing_group.md#field-id) |
| <a name="field-procuring_system_operator_id" href="#field-procuring_system_operator_id">procuring_system_operator_id</a> | Reference to the procuring system operator.                        | bigint<br/>Required<br/>Non-updatable                                                                                                                           | [party.id](party.md#field-id)                                     |
| <a name="field-product_type_id" href="#field-product_type_id">product_type_id</a>                                        | References to the product type.                                    | bigint<br/>Required<br/>Non-updatable                                                                                                                           | [product_type.id](product_type.md#field-id)                       |
| <a name="field-status" href="#field-status">status</a>                                                                   | The status of the application.                                     | text<br/>One of: `requested`, `prequalification_pending`, `in_progress`, `temporary_qualified`, `prequalified`, `verified`, `rejected`<br/>Default: `requested` |                                                                   |
| <a name="field-notes" href="#field-notes">notes</a>                                                                      | Free text notes on the current product application status.         | text<br/>Max length: `512`                                                                                                                                      |                                                                   |
| <a name="field-last_prequalified" href="#field-last_prequalified">last_prequalified</a>                                  | When the product application was last prequalified.                | timestamp with time zone                                                                                                                                        |                                                                   |
| <a name="field-last_verified" href="#field-last_verified">last_verified</a>                                              | When the product application was last verified.                    | timestamp with time zone                                                                                                                                        |                                                                   |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                                    | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only                                                                                                                          |                                                                   |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                                    | The identity that recorded the resource.                           | bigint<br/>Read only                                                                                                                                            |                                                                   |

## Validation Rules

| Validation rule key | Validation rule                                                                   | Status |
|---------------------|-----------------------------------------------------------------------------------|--------|
| SPGPA-VAL001        | Product applications can only be created on active SPGs.                          | DONE   |
| SPGPA-VAL002        | Product applications can only be created on active system operator product types. | DONE   |

## Notifications

| Action         | Recipient               | Comment |
|----------------|-------------------------|---------|
| create, update | Procuring SO, SP of SPG |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

| Policy key   | Policy                                    | Status |
|--------------|-------------------------------------------|--------|
| SPGPA-COM001 | Read history on SPGPA that they can read. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key    | Policy                     | Status |
|---------------|----------------------------|--------|
| SPGPA-FISO001 | Read and update all SPGPA. | DONE   |

#### Market Operator

No policies.

#### System Operator

| Policy key  | Policy                       | Status |
|-------------|------------------------------|--------|
| SPGPA-SO001 | Read all SPGPA.              | DONE   |
| SPGPA-SO002 | Update SPGPA targeting them. | DONE   |

#### Service Provider

| Policy key  | Policy                                                        | Status |
|-------------|---------------------------------------------------------------|--------|
| SPGPA-SP001 | Create, read and update SPGPA for SPG they are in charge for. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party)

| FIELD                        | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|------------------------------|------|-----|----|----|------|----|----|----|----|
| id                           |      | R   | R  | R  | R    | R  | R  | R  | R  |
| service_providing_group_id   |      | R   | R  | R  | R    | R  | R  | RC | R  |
| procuring_system_operator_id |      | R   | R  | R  | R    | R  | R  | RC | R  |
| product_type_id              |      | R   | R  | R  | R    | R  | R  | RC | R  |
| status                       |      | R   | R  | R  | RU   | R  | RU | RU | R  |
| notes                        |      | R   | R  | R  | RU   | R  | RU | R  | R  |
| last_prequalified            |      | R   | R  | R  | RU   | R  | RU | R  | R  |
| last_verified                |      | R   | R  | R  | RU   | R  | RU | R  | R  |
| recorded_at                  |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by                  |      | R   | R  | R  | R    | R  | R  | R  | R  |
