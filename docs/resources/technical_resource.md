# Technical resource

This resource holds technical details about units and resources that the
controllable unit consists of. The purpose of this resource is to register
information that can help procuring system operators performing product
pre-qualification and simplify that evaluation if controllable units are
identical.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_technical_resource)
* [Download docx](/docs/download/technical_resource.docx)

## Fields

| Name                                                                                             | Description                                                                 | Format                                 | Reference                                             |
|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|----------------------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                       | Unique surrogate identifier.                                                | bigint<br/>Read only                   |                                                       |
| <a name="field-name" href="#field-name">name</a>                                                 | Name of the technical resource. Maximum 128 characters.                     | text<br/>Required                      |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a> | Reference to the controllable unit that this technical resource belongs to. | bigint<br/>Required<br/>Non-updatable  | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-details" href="#field-details">details</a>                                        | Free text details about the technical resource.                             | text<br/>Max length: `1024`            |                                                       |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                            | When the resource was recorded (created or updated) in the system.          | timestamp with time zone<br/>Read only |                                                       |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                            | The identity that recorded the resource.                                    | bigint<br/>Read only                   |                                                       |

## Validation Rules

### Inter-Field Validation

No validation rules.

### Resource-Level Validation

No validation rules

### Process-Level Validation

No validation rules.

## Notifications

| Action                 | Recipient           | Comment                   |
|------------------------|---------------------|---------------------------|
| create, update, delete | Active SP on CU     |                           |
| create, update, delete | Connecting SO on CU | If CU status is not `new` |

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Entity

No policies.

#### Anonymous

No policies.

#### Common

| Policy key | Policy                                      | Status |
|------------|---------------------------------------------|--------|
| TR-COM001  | Read history on TR that they can read.      | DONE   |
| TR-COM002  | Read TR belonging to CU that they can read. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key | Policy                                  | Status |
|------------|-----------------------------------------|--------|
| TR-FISO001 | Read, create, update and delete all TR. | DONE   |

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

| Policy key | Policy                                                        | Status |
|------------|---------------------------------------------------------------|--------|
| TR-SP001   | Create, update and delete TR on CU where they are current SP. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD                | ANON | BRP | ES | EU | FISO | MO | SO | SP  | TP |
|----------------------|------|-----|----|----|------|----|----|-----|----|
| id                   |      | R   | R  | R  | R    | R  | R  | R   | R  |
| name                 |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |
| controllable_unit_id |      | R   | R  | R  | RC   | R  | R  | RC  | R  |
| details              |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |
| recorded_at          |      | R   | R  | R  | R    | R  | R  | R   | R  |
| recorded_by          |      | R   | R  | R  | R    | R  | R  | R   | R  |
