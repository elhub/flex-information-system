# Accounting point end user

Relation linking an end user to an accounting point.

Data from Elhub.

## Visibility restriction

In order to model their responsibility for a CU, a SP owns a CU-SP relation in
our system. Such a relation is backed by a contract, so in a normal situation,
we should be able to trace it back to a single end user.

However, because some of our data (including the AP-EU resource described on
this page) come from Elhub, the synchronisation process may introduce some lag
in the relations, meaning that a single CU-SP relation could range over several
end users for a given accounting point. In such cases, we do not know which of
them will eventually become the only one really associated to the CU-SP once the
inconsistencies have been corrected. Therefore, in such a case, end users on the
accounting point will not be visible to the SP and they will get a notice so
that they know something has to be corrected.

Moreover, a CU-SP should not give service providers the right to see what
happens outside of the relation. This means that the access given to the
AP-EU relations should filter dates so that the SP only sees a start or end date
if it is included in the span of the CU-SP relation. For instance, the SP should
not see whether an end user is planning to move after the end of the CU-SP
contract. They should see the end user relation as unbounded even though it is
actually not. This is what we refer to as visibility in the RLA rules below.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_accounting_point_end_user)
* [Download docx](/docs/download/accounting_point_end_user.docx)

## Fields

| Name                                                                                          | Description                                                                                                                              | Format                                 | Reference                                           |
|-----------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|-----------------------------------------------------|
| <a name="field-id" href="#field-id">id</a>                                                    | Unique surrogate identifier.                                                                                                             | bigint<br/>Read only                   |                                                     |
| <a name="field-accounting_point_id" href="#field-accounting_point_id">accounting_point_id</a> | The ID of the accounting point.                                                                                                          | bigint<br/>Read only                   | [accounting_point.id](accounting_point.md#field-id) |
| <a name="field-end_user_id" href="#field-end_user_id">end_user_id</a>                         | The end user of the accounting point.                                                                                                    | bigint<br/>Read only                   | [party.id](party.md#field-id)                       |
| <a name="field-valid_from" href="#field-valid_from">valid_from</a>                            | The date from which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone.  | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-valid_to" href="#field-valid_to">valid_to</a>                                  | The date until which the relation between the accounting point and the energy supplier is valid. Midnight aligned on Norwegian timezone. | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-recorded_at" href="#field-recorded_at">recorded_at</a>                         | When the resource was recorded (created or updated) in the system.                                                                       | timestamp with time zone<br/>Read only |                                                     |
| <a name="field-recorded_by" href="#field-recorded_by">recorded_by</a>                         | The identity that recorded the resource.                                                                                                 | bigint<br/>Read only                   |                                                     |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Entity

No policies.

#### Anonymous

No policies.

#### Common

No policies.

#### Balance Responsible Party

No policies.

#### End User

| Policy key | Policy                                            | Status |
|------------|---------------------------------------------------|--------|
| APEU-EU001 | Read APEU on periods where they are the end user. | TODO   |

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

| Policy key   | Policy         | Status |
|--------------|----------------|--------|
| APEU-FISO001 | Read all APEU. | TODO   |

#### Market Operator

No policies.

#### System Operator

| Policy key | Policy                                    | Status |
|------------|-------------------------------------------|--------|
| APEU-SO001 | Read all APEU on their accounting points. | TODO   |

#### Service Provider

| Policy key | Policy                                                                                                                                               | Status |
|------------|------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| APEU-SP001 | Read APEU on periods where they are related to a CU on the AP. Visibility restricted to the CU-SP valid time and provided that there is only one EU. | TODO   |

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD               | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|---------------------|------|-----|----|----|------|----|----|----|----|
| id                  |      | R   | R  | R  | R    | R  | R  | R  | R  |
| accounting_point_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| end_user_id         |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_from          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| valid_to            |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_at         |      | R   | R  | R  | R    | R  | R  | R  | R  |
| recorded_by         |      | R   | R  | R  | R    | R  | R  | R  | R  |
