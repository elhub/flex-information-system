# Party Membership

[Entities](entity.md) memberships on different parties. Basically assigns
persons or organisations to parties.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_party_membership)
* [Download docx](../download/party_membership.docx)

## Fields

| Name                                                                  | Description                                                        | Format                                 | Reference                       |
|-----------------------------------------------------------------------|--------------------------------------------------------------------|----------------------------------------|---------------------------------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                                       | bigint<br/>Read only                   |                                 |
| <a name="field-party_id" href="#field-party_id">party_id</a>          | Reference to the party that the membership links to an entity.     | bigint<br/>Required<br/>Non-updatable  | [party.id](party.md#field-id)   |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>       | Reference to the entity that the party represents.                 | bigint<br/>Required<br/>Non-updatable  | [entity.id](entity.md#field-id) |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a> | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only |                                 |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a> | The identity that recorded the resource.                           | bigint<br/>Read only                   |                                 |

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
| PTYM-ENT002 | Read all the PTYM in owned parties              | DONE   |

#### Anonymous

No policies.

#### Common

| Policy key  | Policy                                                    | Status |
|-------------|-----------------------------------------------------------|--------|
| PTYM-COM001 | Read history on all PTYM that they can read               | DONE   |
| PTYM-COM002 | Read all the PTYM concerning the current party            | DONE   |
| PTYM-COM003 | Read all the history of PTYM concerning the current party | DONE   |

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

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|-------------|------|-----|----|----|------|----|----|----|----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| entity_id   |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| party_id    |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| recorded_at |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by |      | R   | R  | R  | R    | R  | R  | R  | R  |
