# Event

An event happening in the system.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_event)
* [Download docx](../download/event.docx)

## Fields

| Name                                                                  | Description                                                            | Format                                                          | Reference |
|-----------------------------------------------------------------------|------------------------------------------------------------------------|-----------------------------------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                                           | bigint<br/>Read only                                            |           |
| <a name="field-specversion" href="#field-specversion">specversion</a> | The version of the CloudEvents specification followed by the resource. | text<br/>Read only                                              |           |
| <a name="field-time" href="#field-time">time</a>                      | The time at which the event was generated.                             | timestamp with time zone<br/>Read only                          |           |
| <a name="field-type" href="#field-type">type</a>                      | The type of the event.                                                 | text<br/>Pattern: `^no.elhub.flex.`<br/>Read only               |           |
| <a name="field-source" href="#field-source">source</a>                | The URI of the resource concerned by the event.                        | text<br/>Pattern: `^(\/([a-z][a-z_]*\|[0-9]+))+$`<br/>Read only |           |
| <a name="field-data" href="#field-data">data</a>                      | The data of the event.                                                 | text<br/>Read only                                              |           |

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

#### Entity

No policies.

#### Common

No policies.

#### Balance Responsible Party

| Policy key    | Policy                                                                                        | Status |
|---------------|-----------------------------------------------------------------------------------------------|--------|
| EVENT-BRP001  | Read events related to controllable units or technical resources when they are BRP on the AP. | TODO   |

#### End User

| Policy key   | Policy                                                                                       | Status |
|--------------|----------------------------------------------------------------------------------------------|--------|
| EVENT-EU001  | Read events related to controllable units or technical resources when they are EU on the AP. | TODO   |

#### Energy Supplier

| Policy key   | Policy                                                                                       | Status |
|--------------|----------------------------------------------------------------------------------------------|--------|
| EVENT-ES001  | Read events related to controllable units or technical resources when they are ES on the AP. | TODO   |

#### Flexibility Information System Operator

| Policy key     | Policy           | Status |
|----------------|------------------|--------|
| EVENT-FISO001  | Read all events. | TODO   |

#### Market Operator

No policies.

#### System Operator

| Policy key   | Policy                                                                                                                                                                                                                                        | Status |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| EVENT-SO001  | Read events related to controllable units or technical resources when they are own the AP or the CU is in an SPG they can see.                                                                                                                | TODO   |
| EVENT-SO002  | Read events related to SOPT concerning themselves.                                                                                                                                                                                            | TODO   |
| EVENT-SO003  | Read events related to SPPA targeting them.                                                                                                                                                                                                   | TODO   |
| EVENT-SO004  | Read events related to comments on SPPA targeting them, when they can see the comments.                                                                                                                                                       | TODO   |
| EVENT-SO005  | Read events related to SPG, including memberships, grid prequalifications, and product applications, when one of the product applications target them or they are one of the impacted system operators for one of the grid prequalifications. | TODO   |

#### Service Provider

| Policy key   | Policy                                                                                                                      | Status |
|--------------|-----------------------------------------------------------------------------------------------------------------------------|--------|
| EVENT-SP001  | Read events related to controllable units or technical resources when they are SP on the CU.                                | TODO   |
| EVENT-SP002  | Read events related to SPPA concerning themselves.                                                                          | TODO   |
| EVENT-SP003  | Read events related to comments on SPPA concerning themselves, when they can see the comments.                              | TODO   |
| EVENT-SP004  | Read events related to SPG, including memberships, grid prequalifications, and product applications, when they own the SPG. | TODO   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|-------------|------|-----|----|----|------|----|----|----|----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| specversion |      | R   | R  | R  | R    | R  | R  | R  | R  |
| time        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| type        |      | R   | R  | R  | R    | R  | R  | R  | R  |
| source      |      | R   | R  | R  | R    | R  | R  | R  | R  |
| data        |      | R   | R  | R  | R    | R  | R  | R  | R  |
