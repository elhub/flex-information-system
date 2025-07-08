# Notification

A notification of an event happening in the system.

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_notification)
* [Download docx](../download/notification.docx)

## Fields

| Name                                                                     | Description                                                        | Format                                 | Reference                     |
|--------------------------------------------------------------------------|--------------------------------------------------------------------|----------------------------------------|-------------------------------|
| <a name="field-id" href="#field-id">id</a>                               | Unique surrogate identifier.                                       | bigint<br/>Read only                   |                               |
| <a name="field-acknowledged" href="#field-acknowledged">acknowledged</a> | Whether the notification was acknowledged by the target user.      | boolean<br/>Required                   |                               |
| <a name="field-event_id" href="#field-event_id">event_id</a>             | Reference to the event notified by this resource.                  | bigint<br/>Required<br/>Non-updatable  | [event.id](event.md#field-id) |
| <a name="field-party_id" href="#field-party_id">party_id</a>             | Reference to the party concerned by this notification.             | bigint<br/>Required<br/>Non-updatable  | [party.id](party.md#field-id) |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>    | When the resource was recorded (created or updated) in the system. | timestamp with time zone<br/>Read only |                               |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>    | The identity that recorded the resource.                           | bigint<br/>Read only                   |                               |

## Validation Rules

No validation rules.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

No policies.

#### Common

| Policy key  | Policy                                             | Status |
|-------------|----------------------------------------------------|--------|
| NOT-COM001  | Read and acknowledge notifications targeting them. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key   | Policy                  | Status |
|--------------|-------------------------|--------|
| NOT-FISO001  | Read all notifications. | DONE   |

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

| FIELD        | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP | ENT |
|--------------|------|-----|----|----|------|----|----|----|----|-----|
| id           |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| acknowledged |      | RU  | RU | RU | RU   | RU | RU | RU | RU |     |
| event_id     |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| party_id     |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| recorded_at  |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
| recorded_by  |      | R   | R  | R  | R    | R  | R  | R  | R  |     |
