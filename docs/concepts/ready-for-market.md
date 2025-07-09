# Ready for market

Before a service provider can use a service providing group (SPG) in the market,
they need to know that the SPG is ready.

## What does SP need to determine if a service providing group is ready for market?

* Is CU part of the SPG validated?
* Is SPG grid prequalified?
* Is SP qualified for product?
* Is SPG prequalified or verified for product?
* Is the product(s) suspended?
* Any temporary limits?
* Any other limitations (ex. TPV)?

To answer several of these questions, the SP need to understand how to read
statuses and related timestamp.

### Overview of statuses

| Process                   | Status                                                                                       | Timestamp                        |
|---------------------------|----------------------------------------------------------------------------------------------|----------------------------------|
| CU grid validation        | pending, in_progress, incomplete_information, validated, validation_failed                   | Last validated                   |
| SPG grid prequalification | in_progress, approved, conditionally_approved, not_approved                                  | last prequalified                |
| SP product application    | in_progress, communication_test, qualified, not_qualified                                    | last qualified                   |
| SPG product application   | in_progress, temporary_qualified, prequalification_pending, prequalified, rejected, verified | last prequalified, last verified |

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

| Status      | Last prequalified / verified | Approved |
|-------------|------------------------------|----------|
| in_progress |                              | No       |

If there are changes to an SPG which requires a new approval process, status
will be updated to in_progress.

| Status      | Last prequalified / verified | Approved |
|-------------|------------------------------|----------|
| in_progress | 01.01.2025 10:00             | Yes      |

If approval is withdrawn, SO updates status and remove the timestsamp.

| Status   | Last prequalified / verified | Approved |
|----------|------------------------------|----------|
| rejected |                              | No       |

#### Issues to be disucssed

* If the status is set to "validated", "approved", "qualified", or
  "prequalified", but the timestamp is missing — what should be the expected
  behavior?
* Should the timestamp be mandatory in these cases, or should the presence of
  one of these statuses alone be enough to consider the CU/SPG approved?

### Other needs

To determine if an SPG is ready for market, it is not enough with statuses. SP
will need information or some kind of tool to know if there are other "issues"
linked to their SPG.

Examples:

* Suspensions
    * CU
    * SPG
    * Product(s)
* Temporary limits
* TPV
