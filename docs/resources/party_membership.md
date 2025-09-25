# Party Membership

[Entities](entity.md) memberships on different parties. Basically assigns
persons or organisations to parties.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_party_membership)
* [Download docx](../download/party_membership.docx)

## Fields

| Name                                                                  | Description                                                                                                                                                                    | Format                                 | Reference                       |
|-----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|---------------------------------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                                                                                                                                                   | bigint<br/>Read only                   |                                 |
| <a name="field-party_id" href="#field-party_id">party_id</a>          | Reference to the party that the membership links to an entity.                                                                                                                 | bigint<br/>Required<br/>Non-updatable  | [party.id](party.md#field-id)   |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>       | Reference to the entity that the party represents.                                                                                                                             | bigint<br/>Required<br/>Non-updatable  | [entity.id](entity.md#field-id) |
| <a name="field-scopes" href="#field-scopes">scopes</a>                | List of scopes granted to the entity when it acts as the party. Scopes are inspired from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. | <br/>Required<br/>Array                |                                 |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a> | When the resource was recorded (created or updated) in the system.                                                                                                             | timestamp with time zone<br/>Read only |                                 |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a> | The identity that recorded the resource.                                                                                                                                       | bigint<br/>Read only                   |                                 |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Entity

| Policy key  | Policy                                          | Status |
|-------------|-------------------------------------------------|--------|
| PTYM-ENT001 | Read all the PTYM concerning the current entity | DONE   |
| PTYM-ENT002 | Read all the PTYM in parties that they own      | DONE   |

#### Anonymous

No policies.

#### Common

| Policy key  | Policy                                                    | Status |
|-------------|-----------------------------------------------------------|--------|
| PTYM-COM001 | Read all the PTYM concerning the current party            | TODO   |
| PTYM-COM002 | Read all the history of PTYM concerning the current party | TODO   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key   | Policy                            | Status |
|--------------|-----------------------------------|--------|
| PTYM-FISO001 | Create, read, and delete all PTYM | DONE   |
| PTYM-FISO002 | Read all PTYM history             | DONE   |

#### Market Operator

No policies.

#### Organisation

| Policy key  | Policy                                                                                                 | Status |
|-------------|--------------------------------------------------------------------------------------------------------|--------|
| PTYM-ORG001 | Read, create, update and delete PTYM on all parties owned by the entity owning the organisation party. | DONE   |
| PTYM-ORG002 | Read PTYM history on all parties owned by the entity owning the organisation party.                    | TODO   |

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|-------------|------|-----|----|----|------|----|----|----|----|-----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
| entity_id   |      | R   | R  | R  | RC   | R  | R  | R  | R  | RC  |
| party_id    |      | R   | R  | R  | RC   | R  | R  | R  | R  | RC  |
| scopes      |      | R   | R  | R  | RCU  | R  | R  | R  | R  | RCU |
| recorded_at |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
| recorded_by |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
