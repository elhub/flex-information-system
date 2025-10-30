# SPG Product Suspension

This process is used to [suspend](../concepts/suspension.md) the service
providing group (SPG) product prequalification temporarily.

The suspension is valid for the following combination:

* `service providing group`- the group that is suspended.
* `product types` - a list of product types that the SPG is qualified for.
* `procuring system operator`- the one that suspends.

This means that the suspension does _not_ impact other procuring system operators.

Reasons for suspension:

| Reason                | Description                                                                                                                              |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `failed_verification` | The agreed upon service has not been delividered - in multiple consecutive trades.                                                       |
| `other`               | Should generally _not_ be used, but can in cases where PSO have a valid reason for suspension that is outside the other defined reasons. |

The process also includes reinstatement of the SPG product prequalification,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.

## Sequence

[Full Size](../diagrams/service_providing_group_product_suspension.png) |
[PlantUML description](../diagrams/service_providing_group_product_suspension.plantuml)

![Service Provider contract and termination](../diagrams/service_providing_group_product_suspension.png)
