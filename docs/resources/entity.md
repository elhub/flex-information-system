# Entity

A legal (organisation) or natural person. Used in authentication.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_entity)
* [Download docx](/docs/download/entity.docx)

## Fields

| Name                                                                                 | Description                                                                  | Format               | Reference |
|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|----------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                                           | Unique surrogate identifier.<br/><br/>Note:<br/>This is a Primary Key.       | bigint<br/>Read only |           |
| <a name="field-business_id" href="#field-business_id">business_id</a>                | The business identifier of the entity. Format depends on `business_id_type`. | text<br/>Read only   |           |
| <a name="field-business_id_type" href="#field-business_id_type">business_id_type</a> | The type of the business identifier.                                         | text<br/>Read only   |           |
| <a name="field-name" href="#field-name">name</a>                                     | Name of the entity. Maximum 128 characters.                                  | text<br/>Read only   |           |
| <a name="field-type" href="#field-type">type</a>                                     | The type of the entity, e.g Person, Organisation                             | text<br/>Read only   |           |

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

| Policy key  | Policy       | Status |
|-------------|--------------|--------|
| ENT-FISO001 | Read all ENT | DONE   |

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party)

| FIELD            | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|------------------|------|-----|----|----|------|----|----|----|----|
| id               |      | R   | R  | R  | R    | R  | R  | R  | R  |
| name             |      | R   | R  | R  | R    | R  | R  | R  | R  |
| type             |      | R   | R  | R  | R    | R  | R  | R  | R  |
| business_id      |      | R   | R  | R  | R    | R  | R  | R  | R  |
| business_id_type |      | R   | R  | R  | R    | R  | R  | R  | R  |
