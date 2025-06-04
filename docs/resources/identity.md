# Identity

Resource uniquely identifying a user by linking its entity and the potentially
assumed party.

## Relevant links

* [API Documentation](https://flex-test.elhub.no/api/v0/#/operations/list_identity)
* [Download docx](../download/identity.docx)

## Fields

| Name                                                                  | Description                                   | Format               | Reference                           |
|-----------------------------------------------------------------------|-----------------------------------------------|----------------------|-------------------------------------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                  | bigint<br/>Read only |                                     |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>       | Reference to the entity using the identity.   | bigint<br/>Read only | [entity.id](entity.md#field-id)     |
| <a name="field-entity_name" href="#field-entity_name">entity_name</a> | Name of the entity using the identity.        | text<br/>Read only   | [entity.name](entity.md#field-name) |
| <a name="field-party_id" href="#field-party_id">party_id</a>          | Reference to the party assumed by the entity. | bigint<br/>Read only | [party.id](party.md#field-id)       |
| <a name="field-party_name" href="#field-party_name">party_name</a>    | Name of the party assumed by the entity.      | text<br/>Read only   | [party.name](party.md#field-name)   |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

| Policy key | Policy               | Status |
|------------|----------------------|--------|
| ID-ENT001  | Read all identities. | DONE   |

#### Common

| Policy key | Policy               | Status |
|------------|----------------------|--------|
| ID-COM001  | Read all identities. | DONE   |

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

!!! info "Externally influenced FLA"

    This resource contains fields joined from other resources:

    - `entity_*` fields come from the `entity` resource ;
    - `party_*` fields come from the `party` resource.

    Therefore, `identity` follows the RLA of these other resources for these
    fields, and the authorizations below may apply only partially. In the case
    where the user is not allowed to read the fields from the other resource,
    null values will be showed in the `identity` resource.

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|-------------|------|-----|----|----|------|----|----|----|----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| entity_id   |      | R   | R  | R  | R    | R  | R  | R  | R  |
| entity_name |      | R   | R  | R  | R    | R  | R  | R  | R  |
| party_id    |      | R   | R  | R  | R    | R  | R  | R  | R  |
| party_name  |      | R   | R  | R  | R    | R  | R  | R  | R  |
