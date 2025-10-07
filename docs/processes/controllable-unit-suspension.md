# CU Suspension

This process is used to [suspend](../concepts/suspension.md) the controllable
unit (CU) temporarily. The suspension is done by a connecting system operator
and is registered in the flexibility information system (FIS) by creating a CU suspension.
By registering it in the FIS, both the service provider and impacted system operators
will be made aware of the suspension.

The suspension is valid for the following combination:

* `controllable unit` - the CU that is suspended.
* `service provider`- the supplier of the CU.
* `connecting system operator`- the one that suspends.

Impacted system operators will have to consider if they need to do a new SPG
grid prequalification due to the suspension of the CU. The impacted systemoperators
will receive notification of the suspension.

Procuring system operators are _not_ impacted by the suspension unless the suspension
affects the SPG grid prequalification. Procuring system operators will not receive
notification of the suspension, but will receive notification in case of a new
SPG grid prequalification.

The connecting system operator must include the reason for suspension when
suspending.The reason for suspension is a predefined list. There are two
reasons for that. The first is that the CSO is only allowed to suspend for
valid reasons. The other is that it allows for a greater degree of automation
in the process.

| Reason                   | Description                                                                                                                     |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `incorrect_data`         | The CU data is incorrect.                                                                                                       |
| `other`                  | Should generally _not_ be used, but can in cases where CSO has a valid reason for suspension that is outside the other defined. |

Depending on the reason for suspension, the system operator should warn the
service provider in advance of the suspension. The reasons for suspension that
require a warning in advance of the suspension - and how that warning is
conveyed - must be specified in the national terms and conditions.

The process also includes reinstatement of the controllable unit validation,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.
* Adding and lifting a suspension is instantaneous. There is no need to
  communicate suspension or reinstatement ahead in time.
* End users should not be notified about or view the suspension in FIS. Service
  providers will notify end users when necessary and dependent on the agreement
  between them and the end user.
* The suspension of the SPG will impact the [ready for market](https://elhub.github.io/flex-information-system/concepts/ready-for-market/)
  status for a SPG.

## Sequence

[Full Size](../diagrams/controllable_unit_suspension.png)
| [PlantUML description](../diagrams/controllable_unit_suspension.plantuml)

![Service Provider Registration](../diagrams/controllable_unit_suspension.png)