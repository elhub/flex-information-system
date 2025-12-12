# Event

An event happening in the system.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_event)
* [Download docx](../download/event.docx)

## Fields

| Name                                                                  | Description                                                                           | Format                                                                                                                                                             | Reference |
|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                                                          | bigint<br/>Read only                                                                                                                                               |           |
| <a name="field-specversion" href="#field-specversion">specversion</a> | The version of the CloudEvents specification followed by the resource.                | text<br/>Read only                                                                                                                                                 |           |
| <a name="field-time" href="#field-time">time</a>                      | The time at which the event was generated.                                            | timestamp with time zone<br/>Read only                                                                                                                             |           |
| <a name="field-type" href="#field-type">type</a>                      | The type of the event.                                                                | text<br/>Pattern: `^no.elhub.flex.`<br/>Read only                                                                                                                  |           |
| <a name="field-source" href="#field-source">source</a>                | The URI of the resource concerned by the event.                                       | text<br/>Pattern: `^(\/([a-z][a-z_]*\|[0-9]+))+$`<br/>Read only                                                                                                    |           |
| <a name="field-subject" href="#field-subject">subject</a>             | The URI of the specific subject of the event within the resource pointed by `source`. | text<br/>Read only<br/><br/>Used in cases where an event happens on a subresource, but we still want to consider it as an event on the main resource, for clarity. |           |
| <a name="field-data" href="#field-data">data</a>                      | The data of the event.                                                                | text<br/>Read only                                                                                                                                                 |           |

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

| Policy key   | Policy                                                                          | Status |
|--------------|---------------------------------------------------------------------------------|--------|
| EVENT-COM001 | Read events related to a resource that they could read when the event happened. | DONE   |

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

No policies.

#### Service Provider

No policies.

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
| subject     |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| data        |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
