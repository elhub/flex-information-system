# Grouping Controllable Units in a Service Providing Group

This guide explains how a Service Provider (SP) can group Controllable
Units (CU) in a Service Providing Group (SPG) in the Flexibility Information
System (FIS).  

Learn more about the controllable unit, service providing group,
and related concepts here: [Conceptual model](../../concepts/conceptual-model.md)

The illustration below gives an overview of the necessary steps the service
provider must go through to
[group controllable units in a service providing group](../../processes/service-providing-group-registration.md)
in the FIS portal.

![SP SPG registration path](../../diagrams/sp-spg-registration.drawio.png)

The sections that follow describe each step in detail, including both the actions
to take in the portal and the reasons these steps are required.

## 1. Start at SPG registrations

Begin by navigating to `SPG registrations` in the menu.  
This is the entry point for [grouping of controllable units](../../processes/service-providing-group-registration.md).

## 2. Create or select the service providing group

Before creating or selecting an SPG, it is important to consider what the SPG
will be used for. An SPG is the operational unit the service provider uses when
delivering flexibility in the market. This means the SPG should be structured in
a way that reflects:

* Which product types the group is intended to deliver
* [Which bidding zone the units belong to](../../concepts/conceptual-model.md#types-of-bidding-zones)
* How changes to the SPG may affect grid prequalification status

Thinking about the SPG’s purpose early helps ensure that the group is created
correctly and avoids the need for restructuring later.

Depending on your situation, you may either create a new SPG or continue with
one you already have registered.

### 2a. Create a new service providing group

Create a new [service providing group](../../resources/service_providing_group.md)
and fill in the required information as described in the portal.

### 2b. If an SPG is already registered (status: *new*)

If you previously created an SPG but have not yet activated it, you can continue
working on that SPG. Open the SPG from the list and proceed to Step 3.

### 2c. If an SPG is already registered (status: *active*)

If you already have an active SPG, you may add more controllable units to it as
described in Step 3.

**Depending on the changes you make, the system operator may
update the SPG’s grid prequalification status.*

## 3. Add controllable units to the service providing group

Add the CUs you want included in the SPG. The grouping must follow the requirements
relevant to the [product type(s)](../../resources/product_type.md) you want to
deliver.

>[!NOTE]
>
> Adding CUs to an SPG influences multiple processes:
>
>* [Grid prequalification](../../processes/controllable-unit-registration.md):
> It enables the system operator(s) to assess whether the SPG can operate safely
> within the grid.
>* [SPG product application](../../processes/service-provider-product-application.md):
> It influences the prequalification application for the SPG,
> since the technical characteristics of the CUs within the SPG affect the overall
> delivery potential of the group.

## 4. Activate the new service providing group

Review all information to ensure everything is correct before activating the SPG.

Set the [SPG](../../resources/service_providing_group.md) status from **new → active**.

Activation automatically notifies the system operator, who will grid prequalify
the SPG.
Based on the system operator's analysis, the SPG receives a grid prequalification
status and the service provider will be notified.

Information about the status is found under the menu item `SPG registrations`.
