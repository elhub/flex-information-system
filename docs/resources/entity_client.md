# Entity client

Client linked to an entity for client credentials and JWT grant authentication
methods.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_entity_client)
* [Download docx](/docs/download/entity_client.docx)

## Fields

| Name                                                                        | Description                                                                                                                | Format                                                                                                  | Reference                       |
|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|---------------------------------|
| <a name="field-id" href="#field-id">id</a>                                  | Unique surrogate identifier.                                                                                               | bigint<br/>Read only                                                                                    |                                 |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>             | Reference to the entity that this client is attached to.                                                                   | bigint<br/>Required<br/>Non-updatable                                                                   | [entity.id](entity.md#field-id) |
| <a name="field-name" href="#field-name">name</a>                            | Name of the client. Maximum 64 characters.                                                                                 | text<br/>Max length: `64`                                                                               |                                 |
| <a name="field-client_id" href="#field-client_id">client_id</a>             | The identifier of the entity. For use with client credentials authentication method.                                       | text<br/>Required                                                                                       |                                 |
| <a name="field-client_secret" href="#field-client_secret">client_secret</a> | The secret of the entity. For use with client credentials authentication method. Input as plain text but stored encrypted. | text<br/>Min length: `12`                                                                               |                                 |
| <a name="field-public_key" href="#field-public_key">public_key</a>          | The public key of the entity (X.509 SubjectPublicKeyInfo). For use with JWT grant authentication method.                   | text<br/>Pattern: `^-----BEGIN PUBLIC KEY-----\nMIIB[-A-Za-z0-9+/\n]*={0,3}\n-----END PUBLIC KEY-----$` |                                 |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>       | When the resource was recorded (created or updated) in the system.                                                         | timestamp with time zone<br/>Read only                                                                  |                                 |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>       | The identity that recorded the resource.                                                                                   | bigint<br/>Read only                                                                                    |                                 |

## Validation Rules

### Inter-Field Validation

No validation rules.

### Resource-Level Validation

No validation rules

### Process-Level Validation

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

| Policy key | Policy                                             | Status |
|------------|----------------------------------------------------|--------|
| ECL-ENT001 | Read, create, update and delete their own clients. | DONE   |

#### Common

No policies.

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key  | Policy            | Status |
|-------------|-------------------|--------|
| ECL-FISO001 | Read all clients. | DONE   |

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD         | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|---------------|------|-----|----|----|------|----|----|----|----|
| id            |      | R   | R  | R  | R    | R  | R  | R  | R  |
| entity_id     |      | R   | R  | R  | R    | R  | R  | R  | R  |
| name          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| client_id     |      | R   | R  | R  | R    | R  | R  | R  | R  |
| client_secret |      | R   | R  | R  | R    | R  | R  | R  | R  |
| public_key    |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_at   |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by   |      | R   | R  | R  | R    | R  | R  | R  | R  |
