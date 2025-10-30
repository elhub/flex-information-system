# SPG Grid Suspension

This process is used to [suspend](../concepts/suspension.md) the service
providing group (SPG) temporarily.

The suspension is valid for the following combination:

* `service providing group`- the SPG that is suspended.
* `impacted system operator`- the one that suspends.

All procuring system operators will be affected by the suspension as the SPG
will no longer be approved to deliver services. Procuring system operators and
impacted system operators will receive notification of the suspension.

Suspension is a powerful tool, and might not be the right way to limit the use
of a SPG. A SPG grid suspension will effectively prevent the SPG from delivering
*any* services to *any* PSO. The ISO must consider using
softer tools such as temporary limits.

Reasons for suspension:

| Reason                     | Description                                                                                                                                       |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `breach_of_conditions`     | The SPG grid prequalification status is *conditionally_approved* and SPG repeatedly breaches the conditions.                                      |
| `significant_group_change` | In cases where the SPG is altered significantly and ISO needs time to consider if they need to do a new grid prequalification or use other tools. |
| `other`                    | Should generally *not* be used, but can in cases where ISO has a valid reason for suspension that is outside the other defined reasons.           |

The process also includes reinstatement of the service providing group grid prequalification,
i.e. removing the suspension.

## Prerequisites

* The issue that triggers the suspension is temporary.

## Sequence

[Full Size](../diagrams/service_providing_group_grid_suspension.png) |
[PlantUML description](../diagrams/service_providing_group_grid_suspension.plantuml)

![Service Provider Registration](../diagrams/service_providing_group_grid_suspension.png)
