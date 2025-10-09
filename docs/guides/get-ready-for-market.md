# Get ready for market

Before a service provider can participate in the market, several registration and
qualification steps must be completed. The process starts with an empty
Flexibility Information System (FIS) and ends with service providing groups that
are fully validated, (pre)qualified, and ready for market participation.

The diagram below highlights the key steps and their dependencies. It is not a
map of all the processes, but shows the processes required for service providers
and system operators to participate in the market.

> [!TIP]
>
> For a detailed definition of when a service providing group (SPG) is
> considered *ready for market*, check the
> [Ready for market](../concepts/ready-for-market.md) concept page.

## Prerequisites

* System operator is registered in FIS.
* System operator has registered the products they want to procure in FIS.

## Process Groups

The registration and qualification steps can be grouped into two purposes,
which explains why these processes are necessary for market participation:

1. **Ensuring safe operation**
Covers the technical registration of controllable units and the formation of
service providing groups. This ensures that units do not compromise system
security when participating in the market.
Approved by connecting/impacted system operators.

2. **Ensuring delivery capability**
Covers product applications and (pre)qualification steps for both service
providers and service providing groups. This ensures that the provider can
actually deliver the requested product type according to the requirements.
Approved by procuring system operators.

## Registration and Qualification Overview

The following diagram shows how service providers move from an empty FIS to
being ready for market:

<!--[Process priority - the happy path](../diagrams/registration_happy_path.png)-->

![Get ready for market path](../diagrams/ready_for_market.drawio.png)

The diagram shows us that a service provider can register all their data at
once, and that the (pre)qualification processes can run in parallel.

### Notation

We are using the following notation:

* `ellipses` - start and end states
* `rectangles` - processes
    * `solid border` - main process ([Processes](../processes/index.md))
    * `dotted border` - sub-process driving/responsible market party
* colors indicating the driving/responsible market party for a (sub-)process
    * `green` - system operator
    * `blue` - service provider
    * `red` - flexibility information system operator
    * `white` - unspecified
* `arrows` - dependencies between processes
