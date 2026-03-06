# Entity

A legal (organisation) or natural person. Used in authentication.

## Business ID types

According to the type of entity, not all types of business ID can be used.
Here are the acceptable values for entities:

| Type of entity | Acceptable types of business ID  |
|----------------|----------------------------------|
| Organisation   | `org` (_organisasjonsnummer_)    |
| Person         | `pid` (_fødselsnummer_), `email` |

## Lookup

A lookup operation can be performed to check whether a business ID is already
linked to an existing entity in the system, and create the entity if it does not
already exist. This allows users to manage more easily party memberships related
to their organisation, and possibly create entities for their colleagues.

* [API Documentation for Lookup](../api/v0/index.html#/operations/call_entity_lookup)

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_entity)
* [Download docx](../download/entity.docx)

## Fields

| Name                                                                                 | Description                                                                  | Format                                                                   | Reference |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|--------------------------------------------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                                           | Unique surrogate identifier.<br/><br/>Note:<br/>This is a Primary Key.       | bigint<br/>Read only                                                     |           |
| <a name="field-business_id" href="#field-business_id">business_id</a>                | The business identifier of the entity. Format depends on `business_id_type`. | text<br/>Required<br/>Non-updatable                                      |           |
| <a name="field-business_id_type" href="#field-business_id_type">business_id_type</a> | The type of the business identifier.                                         | text<br/>One of: `pid`, `org`, `email`<br/>Required<br/>Non-updatable    |           |
| <a name="field-name" href="#field-name">name</a>                                     | Name of the entity. Maximum 128 characters.                                  | text<br/>Required                                                        |           |
| <a name="field-type" href="#field-type">type</a>                                     | The type of the entity, e.g Person, Organisation                             | text<br/>One of: `person`, `organisation`<br/>Required<br/>Non-updatable |           |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                | When the resource was recorded (created or updated) in the system.           | date-time<br/>Read only                                                  |           |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                | The identity that recorded the resource.                                     | bigint<br/>Read only                                                     |           |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

<!-- markdownlint-disable MD024 -->
#### Entity
<!-- markdownlint-enable MD024 -->

| Policy key | Policy             | Status |
|------------|--------------------|--------|
| ENT-ENT001 | Read their own ENT | DONE   |

#### Common

| Policy key | Policy                                                   | Status |
|------------|----------------------------------------------------------|--------|
| ENT-COM001 | Read all organisation ENT                                | DONE   |
| ENT-COM002 | Read all entities that are members of the current party. | DONE   |
| ENT-COM003 | Read parent entity of current party.                     | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key  | Policy                                | Status |
|-------------|---------------------------------------|--------|
| ENT-FISO001 | Read, create and update all entities. | DONE   |

#### Organisation

| Policy key | Policy                                                                                                                                    | Status |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------|--------|
| ENT-ORG001 | Read all entities belonging to parties owned by the organisation.                                                                         | DONE   |
| ENT-ORG002 | Read all entities with business id type `email`. Temporary policy for test environments with email based entities for professional users. | DONE   |

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD            | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|------------------|------|-----|----|----|------|----|----|----|-----|
| id               |      | R   | R  | R  | R    | R  | R  | R  | R   |
| name             |      | R   | R  | R  | RCU  | R  | R  | R  | R   |
| type             |      | R   | R  | R  | RC   | R  | R  | R  | R   |
| business_id      |      | R   | R  | R  | RC   | R  | R  | R  | R   |
| business_id_type |      | R   | R  | R  | RC   | R  | R  | R  | R   |
| recorded_at      |      | R   | R  | R  | R    | R  | R  | R  | R   |
| recorded_by      |      | R   | R  | R  | R    | R  | R  | R  | R   |
