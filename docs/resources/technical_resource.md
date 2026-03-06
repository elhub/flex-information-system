# Technical Resource

This resource holds technical details about the assets that the
controllable unit consists of. A controllable unit can contain several technical
resources.

For more information about the technical resource and its role in the
flexibility structure, see [Conceptual Model and Terminology](../concepts/conceptual-model.md).

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_technical_resource)
* [Download docx](../download/technical_resource.docx)

## Fields

| Name                                                                                                         | Description                                                                                                                                            | Format                                                                                                         | Reference                                             |
|--------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                                   | Unique surrogate identifier.                                                                                                                           | bigint<br/>Read only                                                                                           |                                                       |
| <a name="field-name" href="#field-name">name</a>                                                             | Name of the technical resource. Maximum 128 characters.                                                                                                | text<br/>Required                                                                                              |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a>             | Reference to the controllable unit that this technical resource belongs to.                                                                            | bigint<br/>Required<br/>Non-updatable                                                                          | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-technology" href="#field-technology">technology</a>                                           | Technologies of the technical resource using ltree path notation. Multiple technologies can be specified for hybrid resources (e.g., solar + battery). | <br/>Required<br/>Array                                                                                        |                                                       |
| <a name="field-category" href="#field-category">category</a>                                                 | Categories derived from the technologies of the technical resource. Automatically computed based on the selected technologies.                         | <br/>Array<br/>Read only                                                                                       |                                                       |
| <a name="field-maximum_active_power" href="#field-maximum_active_power">maximum_active_power</a>             | Maximum continuous active power (rated power) of the technical resource in kilowatts.                                                                  | decimal<br/>Required<br/>Min: `0`<br/>Max: `999999.999`<br/>Multiple of: `0.001`                               |                                                       |
| <a name="field-device_type" href="#field-device_type">device_type</a>                                        | The type of device.                                                                                                                                    | <br/>Required                                                                                                  |                                                       |
| <a name="field-device_make" href="#field-device_make">device_make</a>                                        | The manufacturer of the device. Required if device_model or device_unique_identifier is provided.                                                      | text<br/>Max length: `128`<br/><br/>Must be provided if device_model or device_unique_identifier is specified. |                                                       |
| <a name="field-device_model" href="#field-device_model">device_model</a>                                     | The model of the device.                                                                                                                               | text<br/>Max length: `128`                                                                                     |                                                       |
| <a name="field-device_unique_identifier" href="#field-device_unique_identifier">device_unique_identifier</a> | Unique identifier of the device such as serial number or MAC address.                                                                                  | text<br/>Max length: `256`                                                                                     |                                                       |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                                        | When the resource was recorded (created or updated) in the system.                                                                                     | date-time<br/>Read only                                                                                        |                                                       |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                                        | The identity that recorded the resource.                                                                                                               | bigint<br/>Read only                                                                                           |                                                       |

## Validation Rules

No validation rules.

## Notifications

| Action                 | Recipient           | Comment                   |
|------------------------|---------------------|---------------------------|
| create, update, delete | Active SP on CU     |                           |
| create, update, delete | Connecting SO on CU | If CU status is not `new` |

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the resource. The default policy is **deny**.

#### Entity

No policies.

#### Anonymous

No policies.

#### Common

No policies.

#### Balance Responsible Party

| Policy key | Policy                                                                     | Status |
|------------|----------------------------------------------------------------------------|--------|
| TR-BRP001  | Read TR data when they are BRP on the AP. Only for the contract period.    | DONE   |
| TR-BRP002  | Read TR history when they are BRP on the AP. Only for the contract period. | DONE   |

#### End User

| Policy key | Policy                                                                           | Status |
|------------|----------------------------------------------------------------------------------|--------|
| TR-EU001   | Read TR data when they are EU on the AP. Only for when they are EU on the AP.    | DONE   |
| TR-EU002   | Read TR history when they are EU on the AP. Only for when they are EU on the AP. | DONE   |

#### Energy Supplier

| Policy key | Policy                                                                    | Status |
|------------|---------------------------------------------------------------------------|--------|
| TR-ES001   | Read TR data when they are ES on the AP. Only for the contract period.    | DONE   |
| TR-ES002   | Read TR history when they are ES on the AP. Only for the contract period. | DONE   |

#### Flexibility Information System Operator

| Policy key | Policy                                  | Status |
|------------|-----------------------------------------|--------|
| TR-FISO001 | Read, create, update and delete all TR. | DONE   |
| TR-FISO002 | Read all TR history.                    | DONE   |

#### Organisation

No policies.

#### System Operator

| Policy key | Policy                                                  | Status |
|------------|---------------------------------------------------------|--------|
| TR-SO001   | Read TR belonging to CU that the SO can see.            | DONE   |
| TR-SO002   | Read history on TR belonging to CU that the SO can see. | DONE   |

#### Service Provider

| Policy key | Policy                                                        | Status |
|------------|---------------------------------------------------------------|--------|
| TR-SP001   | Create, update and delete TR on CU where they are current SP. | DONE   |
| TR-SP002   | Read TR data for the period they are SP on the CU.            | DONE   |
| TR-SP003   | Read TR history for the period they are SP on the CU.         | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD                | ANON | BRP | ES | EU | FISO | SO | SP  | TP | ORG |
|----------------------|------|-----|----|----|------|----|-----|----|-----|
| id                   |      | R   | R  | R  | R    | R  | R   | R  |     |
| name                 |      | R   | R  | R  | RCU  | R  | RCU | R  |     |
| controllable_unit_id |      | R   | R  | R  | RC   | R  | RC  | R  |     |
| details              |      | R   | R  | R  | RCU  | R  | RCU | R  |     |
| recorded_at          |      | R   | R  | R  | R    | R  | R   | R  |     |
| recorded_by          |      | R   | R  | R  | R    | R  | R   | R  |     |
