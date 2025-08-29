# Ready for market

Before a service provider can use a service providing group (SPG) in the market,
the SPG must be ready.

This document lists the criterias for when an SPG is considered as ready for
market. It contains a description of what must be checked and also a detailed
checklist.

## What makes a SPG ready for market?

* Is SP qualified for product?
* Are the CUs in the SPG validated?
* Is SPG grid prequalified?
* Is SPG prequalified or verified for product?
* Are there any suspended relations?
* Any temporary limits?
* Any other limitations like connection with condition (like TPV or UKT)?

To answer several of these questions, the SP needs to understand how to read
statuses and related timestamps.

### Overview of statuses

| Process                   | Status                                                                                       | Timestamp              |
|---------------------------|----------------------------------------------------------------------------------------------|------------------------|
| CU grid validation        | pending, in_progress, incomplete_information, validated, validation_failed                   | validated              |
| SPG grid prequalification | in_progress, approved, conditionally_approved, not_approved                                  | prequalified           |
| SP product application    | in_progress, communication_test, qualified, not_qualified                                    | qualified              |
| SPG product application   | in_progress, temporary_qualified, prequalification_pending, prequalified, rejected, verified | prequalified, verified |

<br>

Status represents the current stage of the approval process (the approval
process in this context includes validated, approved, qualified, prequalified
and verified). The associated timestamp indicates when the CU or SPG was last
approved. This timestamp should be used to determine whether a CU or SPG is
considered approved, as the status itself may change for various reasons.

If the approval of a CU or SPG is withdrawn, the SO must update the status
accordingly and remove the timestamp.

#### Examples

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

### Other needs

To determine if an SPG is ready for market, it is not enough with statuses. SP
will need information or some kind of tool to know if there are other obstacles
linked to their SPG being ready for market.

Examples:

* Suspensions of
    * SPG grid qualification
    * SPG grid prequalification
    * SP product qualification
* Temporary limits
* Connection with conditions (like TPV, UKT)

### Ready for market checklist

If a step in the checklist result in `not ready for market`, the SPG is
considered not ready, and there is no need to continue the checklist. If SPG
passes a step, then proceed to the next step. If all steps are passed, the SPG
is ready for market.

There are three "levels" that must be checked when considering if a SPG is ready.

* `Service Provider` - The SP owning the SPG
* `Service Providing Group` - The group itself and its grid and product (pre)qualifications
* `Controllable Unit` - The individual units that are part of the SPG

The following sections outline the checklist for each level.

#### Service provider checklist

| # | Process/check                           | Description                                           | Result                                                   |
|---|-----------------------------------------|-------------------------------------------------------|----------------------------------------------------------|
| 1 | SP product application status           | Check SP product application status.                  | If status is `not_qualified`, then not ready for market. |
| 2 | SP product application status timestamp | Check if SP product application timestamp is present. | If timestamp is missing, then not ready for market.      |
| 3 | SP product application suspension       | Check if SP product application is suspended          | If suspended, then not ready for market.                 |

#### Service providing group checklist

| # | Process/check                              | Description                                            | Result                                                                             |
|---|--------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------|
| 1 | SPG status                                 | Check SPG status                                       | If SPG is deactivated, then not ready for market.                                  |
| 2 | SPG grid prequalification status           | Check SPG grid prequalification status.                | If SPG grid prequalification status is  `not_approved`, then not ready for market. |
| 3 | SPG grid prequalification status timestamp | Check if grid prequalification timestamp is present.   | If timestamp is missing, then not ready for market.                                |
| 4 | SPG grid prequalification suspension       | Check if SPG grid prequalification is suspended        | If suspended, then not ready for market.                                           |
| 5 | SPG product application status             | Check SPG product application status                   | If SPG product application status is `rejected`, then not ready for market.        |
| 6 | SPG product application status timestamp   | Check if SPG product application timestamp is present. | If timestamp is missing, then not ready for market.                                |
| 7 | SPG product application status supension   | Check if SPG product application is suspended.         | If suspended, then not ready for market.                                           |

#### Controllable unit checklist

| # | Process/check                       | Description                               | Result                                                                          |
|---|-------------------------------------|-------------------------------------------|---------------------------------------------------------------------------------|
| 1 | CU status                           | Check CU status.                          | If one or more CU(s) deactivated, then not ready for market?                    |
| 2 | CU grid validation status           | Check CU grid validation status.          | If CU grid validation status is `validation_failed`, then not ready for market. |
| 3 | CU grid validation status timestamp | Check if validated timestamp present.     | If timestamp is missing, then not ready for market.                             |
| 4 | CU grid validation suspension       | Check if CU grid validation is suspended. | If suspended, then not ready for market.                                        |
