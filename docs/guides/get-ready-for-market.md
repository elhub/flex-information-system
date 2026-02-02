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

### 1. Start at CU registrations

Begin by navigating to `CU registrations` in the system.  
This is where all CU registration and management tasks are performed.

### 2. Look up the controllable unit

Before creating a new CU, ensure it does **not** already exist.

Select `Look up a controllable unit` and provide:

* **End‑user ID** (organization number or personal ID number)
* **Accounting point ID** from the end‑user agreement

### 3. Check if the controllable unit already exists

Inspect the list of CUs associated with the accounting point:

* If the CU does **not** appear → proceed to `Create a new controllable unit`.
* If the CU **does** appear → the CU is already registered.  
  If the CU is receiving a new SP contract, follow the
  [SP Switching Initiated by New SP](../processes/service-provider-switching.md) process.

### 4. Create the controllable unit

Provide the required information.

#### **Basic information**

* CU name  
* Start date

#### **Technical information**

Add all relevant technical details.  
This information is important for system operators to ensure secure operation and
evaluate delivery capability.

#### **Grid information**

Every CU must be linked to a **grid node ID**, indicating where it is located in
the grid.  
The grid node ID may be added by either:

* the service provider, or  
* the system operator

### 5. Add a reference to the end‑user contract

Register the contract between the service provider and the end user:

* Contract reference  
* Contract valid period  

The contract establishes the service provider’s right to control the CU and
functions as the authorization mechanism within the register, enabling the
service provider to manage the CU in the system.

> [!NOTE]  
> When creating a new CU, set the contract start time **in the past**.  
> If it is set in the future, you will not have access to manage the CU until
> that date.

### 6. Add technical resources

Select `Add technical resources` to register the actual assets controlled by the
CU.
Each technical resource requires its own detailed information.

### 7. Validate all information

Review all information:

* CU details  
* Technical data  
* Contract information  
* Technical resources  

Ensure everything is correct before activating the CU.

### 8. Activate the controllable unit

Set the CU status from **new → active**.

Activation automatically notifies the system operator, who will grid validate
the CU.
Based on the system operator's analysis, the CU receives a grid validation status.
If the grid validation status is validated, the CU is approved for activation and
may operate on market signals in that part of the grid.

## Step-by-step: How to register a service providing group
