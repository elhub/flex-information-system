# Entity Client

This resource represents a client linked to an entity, to be used in the client
credentials and JWT grant authentication methods.

The main purpose of this resource is to enable machine access to the API.
A program connecting to the API will use one of the clients present on the
entity.
It will thereby get the possibility to act as the party referenced in the
`party_id` field, with the authorisations listed in the client's `scopes`.

Entity clients are secured by a password in `client_secret` or a `public_key`
associated to the private key JWTs sent to the JWT grant authentication will
be signed with.

An entity can have several clients registered, typically an organisation entity
with one client per enterprise machine expected to use the API in an automated
way.

## Example

Let us take the case of a system operator organisation called "Testnett AS".
They have an organisation entity registered in the FIS and a party of type
`system_operator` to be able to act in the system accordingly.

Imagine they want to allow API access to one of their data engineers, not to
interact with the system, but just to perform some data analytics.
This is possible by creating an entity client:

* tied to the organisation entity (`entity_id`)
* allowing access to the SO party (`party_id`)
* with read-only `scopes` to make sure the data engineer does not edit any
  data currently in use (for instance `read:data`)
* with a public key freshly generated in `public_key` (the private key will be
  given to the data engineer).

Then, the target person will just have to use the JWT grant authentication
method with a JWT asking for access to the SO party through the entity client
they received (identified by `client_id` in the JWT claims).
The JWT will have to be signed with the private key corresponding to the public
key stored in the entity client.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_entity_client)
* [Download docx](../download/entity_client.docx)

## Fields

| Name                                                                        | Description                                                                                                                                                                                                                                                                                                       | Format                                                                                                  | Reference                       |
|-----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|---------------------------------|
| <a name="field-id" href="#field-id">id</a>                                  | Unique surrogate identifier.                                                                                                                                                                                                                                                                                      | bigint<br/>Read only                                                                                    |                                 |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>             | Reference to the entity that this client is attached to.                                                                                                                                                                                                                                                          | bigint<br/>Required<br/>Non-updatable                                                                   | [entity.id](entity.md#field-id) |
| <a name="field-name" href="#field-name">name</a>                            | Name of the client.                                                                                                                                                                                                                                                                                               | text<br/>Max length: `256`                                                                              |                                 |
| <a name="field-client_id" href="#field-client_id">client_id</a>             | The identifier of the entity. For use with client credentials authentication method.                                                                                                                                                                                                                              | text<br/>Read only                                                                                      |                                 |
| <a name="field-party_id" href="#field-party_id">party_id</a>                | Reference to the party this client allows to assume. A null value means the client cannot assume any party.                                                                                                                                                                                                       | bigint                                                                                                  | [party.id](party.md#field-id)   |
| <a name="field-scopes" href="#field-scopes">scopes</a>                      | List of scopes granted to the user when it logs in as an entity or when it acts as the party. When assuming a party through party membership, the least privileged set of scopes will be kept.<br/>Scopes are inspired from OAuth 2.0 and allow refinement of access control and privilege delegation mechanisms. | <br/>Required<br/>Array                                                                                 |                                 |
| <a name="field-client_secret" href="#field-client_secret">client_secret</a> | The secret of the entity. For use with client credentials authentication method. Input as plain text but stored encrypted.                                                                                                                                                                                        | text<br/>Min length: `12`                                                                               |                                 |
| <a name="field-public_key" href="#field-public_key">public_key</a>          | The public key of the entity (X.509 SubjectPublicKeyInfo). For use with JWT grant authentication method.                                                                                                                                                                                                          | text<br/>Pattern: `^-----BEGIN PUBLIC KEY-----\nMIIB[-A-Za-z0-9+/\n]*={0,3}\n-----END PUBLIC KEY-----$` |                                 |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>       | When the resource was recorded (created or updated) in the system.                                                                                                                                                                                                                                                | timestamp with time zone<br/>Read only                                                                  |                                 |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>       | The identity that recorded the resource.                                                                                                                                                                                                                                                                          | bigint<br/>Read only                                                                                    |                                 |

## Validation Rules

| Validation rule key | Validation rule                                               | Status |
|---------------------|---------------------------------------------------------------|--------|
| ECL-VAL001          | Entity clients can only target a party the entity can assume. | DONE   |

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
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

#### Organisation

| Policy key | Policy                                                                                                   | Status |
|------------|----------------------------------------------------------------------------------------------------------|--------|
| ECL-ORG001 | Read clients on the entity owning the organisation party.                                                | DONE   |
| ECL-ORG002 | Create, update and delete clients on the entity owning the organisation party, when the user is a human. | DONE   |

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD         | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|---------------|------|-----|----|----|------|----|----|----|----|-----|
| id            |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
| entity_id     |      | R   | R  | R  | R    | R  | R  | R  | R  | RC  |
| name          |      | R   | R  | R  | R    | R  | R  | R  | R  | RCU |
| client_id     |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
| party_id      |      | R   | R  | R  | R    | R  | R  | R  | R  | RCU |
| scopes        |      | R   | R  | R  | R    | R  | R  | R  | R  | RCU |
| client_secret |      | R   | R  | R  | R    | R  | R  | R  | R  | RCU |
| public_key    |      | R   | R  | R  | R    | R  | R  | R  | R  | RCU |
| recorded_at   |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
| recorded_by   |      | R   | R  | R  | R    | R  | R  | R  | R  | R   |
