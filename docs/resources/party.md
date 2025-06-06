# Party

The thing that interacts with and are authorized in the Flexibility
Information System.

A party can have different types, e.g. system operator or end user.

## Business Identifiers

Business identifiers for party originate outside of the system. The system
itself will not generate or administer these identifiers. As an example, a
service provider registration procedure will require the party to obtain a GLN
from GS1 or an EIC-X from ENTSO-E prior to registration (probably via the Ediel Register).

We support both GLN and EIC-X as identifiers for parties, since they are both
used and globally unique.

The exception to this rule is the End User party type, which is not required to
have an external business identifier. End Users are modelled as parties to
standardize/simplify the authorization logic. For those parties, the system will
generate a UUID as the business identifier.

## Relevant links

* [API Documentation](https://elhub.github.io/flex-information-system/api/v0/#/operations/list_party)
* [Download docx](../download/party.docx)

## Fields

| Name                                                                                 | Description                                                                                     | Format                                                                                     | Reference                       |
|--------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|---------------------------------|
| <a name="field-id" href="#field-id">id</a>                                           | Unique surrogate identifier.                                                                    | bigint<br/>Read only                                                                       |                                 |
| <a name="field-business_id" href="#field-business_id">business_id</a>                | The business identifier of the party. Format depends on `business_id_type`.                     | text<br/>Non-updatable                                                                     |                                 |
| <a name="field-business_id_type" href="#field-business_id_type">business_id_type</a> | The type of the business identifier.                                                            | text<br/>One of: `gln`, `uuid`, `eic_x`<br/>Default: `uuid`<br/>Non-updatable              |                                 |
| <a name="field-entity_id" href="#field-entity_id">entity_id</a>                      | Reference to the entity that is the parent of the party.                                        | bigint<br/>Required<br/>Non-updatable                                                      | [entity.id](entity.md#field-id) |
| <a name="field-name" href="#field-name">name</a>                                     | Name of the party. Maximum 128 characters.                                                      | text<br/>Required                                                                          |                                 |
| <a name="field-role" href="#field-role">role</a>                                     | The role of the party. Currently maps to 1:1 to `type`. E.g. system_operator, service_provider. | text<br/>Required<br/>Non-updatable                                                        |                                 |
| <a name="field-type" href="#field-type">type</a>                                     | The type of the party, e.g SystemOperator, ServiceProvider                                      | text<br/>Required<br/>Non-updatable                                                        |                                 |
| <a name="field-status" href="#field-status">status</a>                               | The status of the party.                                                                        | text<br/>One of: `new`, `active`, `inactive`, `suspended`, `terminated`<br/>Default: `new` |                                 |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                | When the resource was recorded (created or updated) in the system.                              | timestamp with time zone<br/>Read only                                                     |                                 |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                | The identity that recorded the resource.                                                        | bigint<br/>Read only                                                                       |                                 |

## Validation Rules

| Policy key | Policy                                                                              | Status |
|------------|-------------------------------------------------------------------------------------|--------|
| PTY-VAL001 | `business_id_type` is UUID if and only if the party is an `end_user`.               | DONE   |
| PTY-VAL002 | `business_id` is not required if `business_id_type` is UUID (it will be generated). | DONE   |

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Entity

| Policy key | Policy                                       | Status |
|------------|----------------------------------------------|--------|
| PTY-ENT001 | Read all PTY whose memberships they can read | DONE   |

#### Anonymous

No policies.

#### Common

| Policy key | Policy                                       | Status |
|------------|----------------------------------------------|--------|
| PTY-COM001 | Read history on PTY that they can read.      | DONE   |
| PTY-COM002 | Read all PTY that are not `end_user`         | DONE   |
| PTY-COM003 | Read all PTY whose memberships they can read | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key  | Policy                          | Status |
|-------------|---------------------------------|--------|
| PTY-FISO001 | Create, read and update all PTY | DONE   |

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

| FIELD            | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|------------------|------|-----|----|----|------|----|----|----|----|
| id               |      | R   | R  | R  | R    | R  | R  | R  | R  |
| name             |      | R   | R  | R  | RCU  | R  | R  | R  | R  |
| business_id      |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| business_id_type |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| entity_id        |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| type             |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| role             |      | R   | R  | R  | RC   | R  | R  | R  | R  |
| status           |      | R   | R  | R  | RU   | R  | R  | R  | R  |
| recorded_at      |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by      |      | R   | R  | R  | R    | R  | R  | R  | R  |
