# SP Product Suspension

This process is used to [suspend](../concepts/suspension.md) the service
provider product qualification temporarily.

The suspension is valid for the following combination.

* `service provider` - the one that is suspended
* `procuring system operator` - the one that suspends
* `product types` - a list of product types that the SP is qualified for

This means that the suspension does _not_ impact other procuring system operators.
Procuring system operators that have qualified the service provider for the same
product type will however be notified of the suspension.

Reasons for suspension:

| Reason                 | Description                                                                                                                              |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| `communication_issues` | There are communication issues between the service provider and the procuring system operator.                                           |
| `failing_heartbeat`    | If SP does not respond to heartbeat, SO may consider the SP to be unavailable for activation.                                            |
| `system_issues`        | There are issues with the service providers systems. Their back office systems used in delivering flexibility.                           |
| `clearing_issues`      | Delayed or lack of payment.                                                                                                              |
| `breach_of_conditions` | The terms of the agreement between the service provider and system operator have been breached multiple consecutive times                |
| `other`                | Should generally _not_ be used, but can in cases where PSO have a valid reason for suspension that is outside the other defined reasons. |

The process also includes reinstatement of the service provider qualification,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.

## Sequence

[Full Size](../diagrams/service_provider_product_suspension.png) |
[PlantUML description](../diagrams/service_provider_product_suspension.plantuml)

![Service Provider contract and termination](../diagrams/service_provider_product_suspension.png)
