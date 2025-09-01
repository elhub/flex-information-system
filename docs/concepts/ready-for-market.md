# Ready for market

Before a service provider can use a service providing group (SPG) in the market,
the SPG must be ready.

This document contains a checklist for when an SPG is considered as ready for
market. A prerequisite for that is understanding how to read and understand the
status of the resources in the FIS.

## Status and timestamps

Many resources in the register have a status and a associated timestamp. For
example a
[service providing group grid prequalification](../resources/service_providing_group_grid_prequalification.md)
has the fields `status` and `last_prequalified`.

A status field represents the current stage of the approval processes of
resources. This means different things for different resources, and includes

* approval
* validation
* qualification
* prequalification
* verification

A status has a finite set of possible values such as `pending`, `in_progress`
and `qualified`.

The timestamp indicates when the CU or SPG was last
approved. This timestamp should be used to determine whether a CU or SPG is
considered approved, as the status itself may change for various reasons.

If the approval of a CU or SPG is withdrawn, the SO must update the status
accordingly and remove the timestamp.

### Examples

When SPG product application is initiated for the first time, SO will update
status to in_progress. As the SPG has not previously been prequalified or
verified, the timestamp field remains empty.

| Status      | Prequalified / verified timestamp | Ready for market? |
|-------------|-----------------------------------|-------------------|
| in_progress |                                   | No                |

If there are changes to an SPG which require a new approval process, status
will be updated to in_progress.

| Status      | Prequalified / verified timestamp | Ready for market? |
|-------------|-----------------------------------|-------------------|
| in_progress | 01.01.2025 10:00                  | Yes               |

If approval is withdrawn, SO updates status and remove the timestsamp.

| Status   | Prequalified / verified timestamp | Ready for market? |
|----------|-----------------------------------|-------------------|
| rejected |                                   | No                |

### Suspension

Suspension is a temporary state set by SO. Suspension is added as separate
fields on the resources. On product (pre) qualification, this takes the form of
a list of suspended product types. On other resources it is set as a boolean
flag indicating that the resource is suspended. To check if resource is
suspended, these fields must be checked.

### Future checks

In addition to status and suspension checks, there are other things that might
be relevant to check in the future. Some examles are:

* Temporary limits
* Connection with conditions (like TPV, UKT)

## Ready for market checklist

The following is a detailed checklist to verify that _a SPG can deliver a
product type to a SO_. If a step in the checklist result in
`not ready for market`, the SPG is considered not ready, and there is no need to
continue the checklist. If SPG passes a step, then proceed to the next step. If
all steps are passed, the SPG is ready for market.

There are three "levels" that must be checked when considering if a SPG is ready.

* `Service Provider` - The SP owning the SPG
* `Service Providing Group` - The group itself and its grid and product (pre)qualifications
* `Controllable Unit` - The individual units that are part of the SPG

The following sections outline the checklist for each level.

### Service provider checklist

We must check the service provider that owns the SPG.

| # | Process/check                           | Description                                           | Result                                                   |
|---|-----------------------------------------|-------------------------------------------------------|----------------------------------------------------------|
| 1 | SP product application status           | Check SP product application status.                  | If status is `not_qualified`, then not ready for market. |
| 2 | SP product application status timestamp | Check if SP product application timestamp is present. | If timestamp is missing, then not ready for market.      |
| 3 | SP product application suspension       | Check if SP product application is suspended          | If suspended, then not ready for market.                 |

### Service providing group checklist

We must then check the SPG itself.

| # | Process/check                              | Description                                            | Result                                                                             |
|---|--------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------|
| 1 | SPG status                                 | Check SPG status                                       | If SPG is deactivated, then not ready for market.                                  |
| 2 | SPG grid prequalification status           | Check SPG grid prequalification status.                | If SPG grid prequalification status is  `not_approved`, then not ready for market. |
| 3 | SPG grid prequalification status timestamp | Check if grid prequalification timestamp is present.   | If timestamp is missing, then not ready for market.                                |
| 4 | SPG grid prequalification suspension       | Check if SPG grid prequalification is suspended        | If suspended, then not ready for market.                                           |
| 5 | SPG product application status             | Check SPG product application status                   | If SPG product application status is `rejected`, then not ready for market.        |
| 6 | SPG product application status timestamp   | Check if SPG product application timestamp is present. | If timestamp is missing, then not ready for market.                                |
| 7 | SPG product application status supension   | Check if SPG product application is suspended.         | If suspended, then not ready for market.                                           |

### Controllable unit checklist

A SPG consists of one or more controllable units. When we check if the SPG is
ready, then we can check that _at least one_ CU is ready.

| # | Process/check                       | Description                               | Result                                                                          |
|---|-------------------------------------|-------------------------------------------|---------------------------------------------------------------------------------|
| 1 | CU status                           | Check CU status.                          | If one or more CU(s) deactivated, then not ready for market?                    |
| 2 | CU grid validation status           | Check CU grid validation status.          | If CU grid validation status is `validation_failed`, then not ready for market. |
| 3 | CU grid validation status timestamp | Check if validated timestamp present.     | If timestamp is missing, then not ready for market.                             |
| 4 | CU grid validation suspension       | Check if CU grid validation is suspended. | If suspended, then not ready for market.                                        |
