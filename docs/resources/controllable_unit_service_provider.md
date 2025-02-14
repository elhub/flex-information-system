# Controllable unit service provider

The relation that links a controllable unit to a service provider. It represents
a contract in the real world. A controllable unit shall be assigned to a maximum
of one service provider per activation period.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_controllable_unit_service_provider)
* [Download docx](/docs/download/controllable_unit_service_provider.docx)

## Fields

| Name                                                                                             | Description                                                                                        | Format                                 | Reference                                             |
|--------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|----------------------------------------|-------------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                       | Unique surrogate key.                                                                              | bigint<br/>Read only                   |                                                       |
| <a name="field-controllable_unit_id" href="#field-controllable_unit_id">controllable_unit_id</a> | Reference to the controllable unit this relation links to a service provider.                      | bigint<br/>Required<br/>Non-updatable  | [controllable_unit.id](controllable_unit.md#field-id) |
| <a name="field-service_provider_id" href="#field-service_provider_id">service_provider_id</a>    | Reference to the `party` (service provider) this relation links to a controllable unit.            | bigint<br/>Required<br/>Non-updatable  | [party.id](party.md#field-id)                         |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                               | The date from which the relation between the controllable unit and the service provider is valid.  | timestamp with time zone               |                                                       |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                     | The date until which the relation between the controllable unit and the service provider is valid. | timestamp with time zone               |                                                       |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                            | When the resource was recorded (created or updated) in the system.                                 | timestamp with time zone<br/>Read only |                                                       |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                            | The identity that recorded the resource.                                                           | bigint<br/>Read only                   |                                                       |

## Validation Rules

### Inter-Field Validation

| Validation rule key | Validation rule                                        | Status |
|---------------------|--------------------------------------------------------|--------|
| CUSP-IFV001         | Valid time older than 2 weeks can only be set by FISO. | DONE   |

### Resource-Level Validation

No validation rules

### Process-Level Validation

No validation rules.

## Notifications

| Action                 | Recipient                                                 | Comment |
|------------------------|-----------------------------------------------------------|---------|
| create, update, delete | SP                                                        |         |
| create, update, delete | Connecting SO                                             |         |
| create                 | End user(s) in charge of the AP during the CU-SP contract |         |

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Common

No policies.

#### Balance Responsible Party

No policies.

#### End User

| Policy key | Policy                                                                          | Status |
|------------|---------------------------------------------------------------------------------|--------|
| CUSP-EU001 | Read CUSP that overlap with the period where they own the AP.                   | DONE   |
| CUSP-EU002 | Read CUSP history records that overlap with the period where they owned the AP. | DONE   |

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key   | Policy                                    | Status |
|--------------|-------------------------------------------|--------|
| CUSP-FISO001 | Read, create, update and delete all CUSP. | DONE   |
| CUSP-FISO002 | Read history on CUSP that they can read.  | DONE   |

#### Market Operator

No policies.

#### System Operator

| Policy key | Policy                                   | Status |
|------------|------------------------------------------|--------|
| CUSP-SO001 | Read CUSP on CU they can read.           | DONE   |
| CUSP-SO002 | Read history on CUSP that they can read. | DONE   |

#### Service Provider

| Policy key | Policy                                                  | Status |
|------------|---------------------------------------------------------|--------|
| CUSP-SP001 | Create, read, update and delete CUSP where they are SP. | DONE   |
| CUSP-SP002 | Read history on CUSP that they can read.                | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD                | ANON | BRP | ES | EU | FISO | MO | SO | SP  | TP |
|----------------------|------|-----|----|----|------|----|----|-----|----|
| id                   |      | R   | R  | R  | R    | R  | R  | R   | R  |
| controllable_unit_id |      | R   | R  | R  | RC   | R  | R  | RC  | R  |
| service_provider_id  |      | R   | R  | R  | RC   | R  | R  | RC  | R  |
| valid_from           |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |
| valid_to             |      | R   | R  | R  | RCU  | R  | R  | RCU | R  |
| recorded_at          |      | R   | R  | R  | R    | R  | R  | R   | R  |
| recorded_by          |      | R   | R  | R  | R    | R  | R  | R   | R  |
