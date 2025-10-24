# SPG product suspension

This process is used to [suspend](../concepts/suspension.md) the service
providing group (SPG) product prequalification temporarily. The suspension is done
by a procuring system operator and is registered in the flexibility information
system (FIS) by creating a SPG product suspension. By registering it in the FIS,
the service provider will be made aware of the suspension.

The suspension is valid for the following combination:

* `service providing group`- the group that is suspended.
* `product types` - a list of product types that the SPG is qualified for.
* `procuring system operator`- the one that suspends.

This means that the suspension does _not_ impact other procuring system operators.

The system operator must include the reason for suspension when suspending. The
reason for suspension is a predefined list. There are two reasons for that. The
first is that the PSO is only allowed to suspend for valid reasons. The other is
that it allows for a greater degree of automation in the process.

| Reason                | Description                                                                                                                              |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `failed_verification` | The agreed upon service has not been delividered or been delivered in a different way that  - in multiple consecutive trades.            |
| `other`               | Should generally _not_ be used, but can in cases where PSO have a valid reason for suspension that is outside the other defined reasons. |

Depending on the reason for suspension, the system operator should warn the
service provider in advance of the suspension. The reasons for suspension that
require a warning in advance of the suspension - and how that warning is
conveyed - must be specified in the national terms and conditions.

The process also includes reinstatement of the SPG product prequalification,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.
* Adding and lifting a suspension is instantaneus. There is no need to
  communicate suspension or reinstatement ahead in time.
* End users should not be notified about or view the suspension in FIS. Service
  providers will notify end users when necessary and dependent on the agreement
  between them and the end user.
* The suspension of the SPG product prequalification will impact the
  [ready for market](https://elhub.github.io/flex-information-system/concepts/ready-for-market/)
  status for a SPG.

## Sequence

[Full Size](../diagrams/service_providing_group_product_suspension.png) |
[PlantUML description](../diagrams/service_providing_group_product_suspension.plantuml)

![Service Provider contract and termination](../diagrams/service_providing_group_product_suspension.png)