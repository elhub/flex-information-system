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

No policies.

#### End User

| Policy key  | Policy                                                                 | Status |
|-------------|------------------------------------------------------------------------|--------|
| EVENT-EU001 | Read events related to controllable units when they are EU on the AP.  | DONE   |
| EVENT-EU002 | Read events related to CUSP when they are EU on the AP.                | DONE   |
| EVENT-EU003 | Read events related to technical resources when they are EU on the AP. | DONE   |

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key    | Policy           | Status |
|---------------|------------------|--------|
| EVENT-FISO001 | Read all events. | DONE   |

#### Market Operator

No policies.

#### Organisation

No policies.

#### System Operator

| Policy key  | Policy                                                                                            | Status |
|-------------|---------------------------------------------------------------------------------------------------|--------|
| EVENT-SO001 | Read all events related to CU, CUSP, TR, SOPT, SPPA, SPPS, SPPAC, SPPSC, SPG, SPGM, SPGGP, SPGPA. | DONE   |

#### Service Provider

| Policy key  | Policy                                                                                         | Status |
|-------------|------------------------------------------------------------------------------------------------|--------|
| EVENT-SP001 | Read events related to controllable units (except lookup) when they are SP on the CU.          | DONE   |
| EVENT-SP002 | Read events related to technical resources when they are SP on the CU.                         | DONE   |
| EVENT-SP003 | Read events related to CUSP when they are the SP.                                              | DONE   |
| EVENT-SP004 | Read events related to SPPA concerning themselves.                                             | DONE   |
| EVENT-SP005 | Read events related to comments on SPPA concerning themselves, when they can see the comments. | DONE   |
| EVENT-SP006 | Read events related to service providing groups when they own them.                            | DONE   |
| EVENT-SP007 | Read events related to SPG memberships when they own the SPG.                                  | DONE   |
| EVENT-SP008 | Read events related to SPG grid prequalifications when they own the SPG.                       | DONE   |
| EVENT-SP009 | Read events related to SPG product applications when they own the SPG.                         | DONE   |
| EVENT-SP010 | Read events related to SOPT.                                                                   | DONE   |
| EVENT-SP011 | Read events related to SPPS when they are the SP.                                              | DONE   |
| EVENT-SP012 | Read events related to comments on SPPS concerning themselves, when they can see the comments. | DONE   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../technical/auth.md#party-market-actors)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ORG |
|-------------|------|-----|----|----|------|----|----|----|----|-----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| specversion |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| time        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| type        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| source      |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| data        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
