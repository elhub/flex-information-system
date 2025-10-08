# CU Suspension

This process is used to [suspend](../concepts/suspension.md) the controllable
unit (CU) temporarily. The suspension is done by an impacted system operator
and is registered in the flexibility information system (FIS) by creating a CU suspension.
By registering it in the FIS, both the service provider, impacted system operators
and procuring system operators will be made aware of the suspension.

The suspension is valid for the following combination:

* `controllable unit` - the CU that is suspended.
* `service provider`- the supplier of the CU.
* `impacted system operator`- the one that suspends.

All procuring system operators will be affected by the suspension as the CU
will no longer be approved to deliver services. Procuring system operators and
impacted system operators will receive notification of the suspension.

Changes in CU data is handled by the [CU Update](../processes/controllable-unit-update.md) process.
If there are significant changes in CU data or the data is incorrect, the CSO
can perform a new grid validation instead of relying on CU suspension.

If there are issues in the grid where the CU will temporarily be a threat to safe
operation, then temporary limits should be used.

Suspension is a powerful tool, and it should not be the primary way to limit the
use of a CU. A CU suspension will effectively prevent the CU from delivering _any_
services to _any_ procuring system operator.The combination of temporary limits
and new grid validation status should be sufficient to ensure safe operation.
Consequently, CU suspension should not be neccessary unless there is an extraordinary
case. Rather than serving as a primary solution, CU suspension functions as a
safety valve for extraordinary cases.

The system operator must include the reason for suspension when suspending. The
reason for suspension is a predefined list. There are two reasons for that. The
first is that the ISO is only allowed to suspend for valid reasons. The other is
that it allows for a greater degree of automation in the process.

| Reason                  | Description                                                                                                    |
|-------------------------|----------------------------------------------------------------------------------------------------------------|
| `safe_operation_issues` | CU is a threat to safe operation and neither temporary limits nor a new grid validation can resolve the issue. |
| `other`                 | Should generally _not_ be used, but can in cases where ISO has a valid reason for suspension.                  |

Depending on the reason for suspension, the system operator should warn the
service provider in advance of the suspension. The reasons for suspension that
require a warning in advance of the suspension - and how that warning is
conveyed - must be specified in the national terms and conditions.

The process also includes reinstatement of the controllable unit,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.
* Adding and lifting a suspension is instantaneous. There is no need to
  communicate suspension or reinstatement ahead in time.
* End users should not be notified about or view the suspension in FIS. Service
  providers will notify end users when necessary and dependent on the agreement
  between them and the end user.
* The suspension of the CU will impact the [ready for market](https://elhub.github.io/flex-information-system/concepts/ready-for-market/)
  status for a SPG.

## Sequence

[Full Size](../diagrams/controllable_unit_suspension.png)
| [PlantUML description](../diagrams/controllable_unit_suspension.plantuml)

![Service Provider Registration](../diagrams/controllable_unit_suspension.png)