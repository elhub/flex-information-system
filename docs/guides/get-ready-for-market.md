# Get Ready for Market

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

## Step 0: Getting started

Follow the [Getting started](getting-started.md) tutorial to begin using the
Flexibility Information System portal.

## Step-by-step: How to register a controllable unit

This guide explains how a Service Provider (SP) can register a Controllable Unit
(CU) in the Flexibility Information System.  

> [!NOTE]
>
>Relevant links to related processes and resources are provided under each
>step:
>
>* Process pages describe the end-to-end process and show how each step relates
>to other parties.
>
>* Resource pages provide explanations of the resource fields, validation rules,
>notifications and authorization policies.

### 1. Start at CU registrations

Begin by navigating to `CU registrations` in the system.  
This is where all CU registration and management tasks are performed.

### 2. Look up the controllable unit

*Relevant process: [CU lookup](../processes/controllable-unit-lookup.md)*

Before creating a new CU, ensure it does **not** already exist in the register
by performing the CU lookup process.

> [!NOTE]
> The lookup process does more than prevent duplicate CUs:
>
> * It confirms that the accounting point actually belongs to the specified end
> user.
> * It requires an end‑user ID, which prevents unauthorized use of the lookup function.

### 3. Check if the controllable unit already exists

Inspect the list of CUs associated with the accounting point:

* If the CU does **not** appear → proceed to `Create a new controllable unit`.
* If the CU **does** appear → the CU is already registered.  
  *If the CU is receiving a new contract to switch service provider, follow the
  [SP Switching Initiated by New SP](../processes/service-provider-switching.md)
  process.*

> [!NOTE]
>
> Because the CU ID is created only after a CU is registered in FIS, it cannot be
> used to prevent duplicates.
> Service providers must therefore check the list of existing CUs on the accounting
> point to ensure the CU is not already registered.

### 4. Create the controllable unit

*Relevant process: [CU registration](../processes/controllable-unit-registration.md)*

*Relevant resource: [Controllable unit](../resources/controllable_unit.md)*

Provide the required information as described in the portal.

The information is essential for several reasons:

* It enables the system operator to assess whether the CU can operate safely
within the grid.
* It ensures that the CU can be correctly linked to a service providing group (SPG),
which determines how the CU will participate in flexibility markets.
* It influences how the prequalification application for the SPG is structured,
since the technical characteristics of the CU affect the overall
delivery potential of the group.

### 5. Add a reference to the end‑user contract

*Relevant process: [CU registration](../processes/controllable-unit-registration.md)*

*Relevant resource: [Controllable unit service provider](../resources/controllable_unit_service_provider.md)*

Register the contract between the service provider and the end user.

The contract establishes the service provider’s right to control the CU and
functions as the authorization mechanism within the register, enabling the
service provider to manage the CU in the system.

> [!NOTE]  
> When creating a new CU, set the contract start time **in the past**.  
> If it is set in the future, you will not have access to manage the CU until
> that date.

### 6. Add technical resources

*Relevant process: [CU registration](../processes/controllable-unit-registration.md)*

*Relevant resource: [Technical resource](../resources/technical_resource.md)*

Technical resources represent the actual assets that the CU consists of.
Registering these resources is important because:

* It provides the technical details needed by procuring system operators when
performing product pre‑qualification.
* It enables more efficient evaluation when different CUs contain identical or
similar technical resources.

A controllable unit may contain several technical resources, and each must be
added individually in the portal.

### 7. Validate all information

*Relevant process: [CU registration](../processes/controllable-unit-registration.md)*

*Relevant resource: [Controllable unit](../resources/controllable_unit.md)*

Review all information to ensure everything is correct before activating the CU.

### 8. Activate the controllable unit

*Relevant process: [CU registration](../processes/controllable-unit-registration.md)*

*Relevant resource: [Controllable unit](../resources/controllable_unit.md)*

Set the CU status from **new → active**.

Activation automatically notifies the system operator, who will grid validate
the CU.
Based on the system operator's analysis, the CU receives a grid validation status.
If the grid validation status is validated, the CU is approved for activation and
may operate on market signals in that part of the grid.
