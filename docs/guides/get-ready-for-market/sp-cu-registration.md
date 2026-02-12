# Registering a Controllable Unit

This guide explains how a Service Provider (SP) can register a new
[Controllable Unit (CU)](../../resources/controllable_unit.md) in the Flexibility
Information System (FIS).

Learn more about the CU and related concepts here:
[Conceptual model](../../concepts/conceptual-model.md)

The illustration below shows the steps needed to
[register a controllable unit](../../processes/controllable-unit-registration.md)
in the FIS.

![SP CU registration path](../../diagrams/sp_cu_registration.drawio.png)

## 1. Start at CU registrations

Begin by navigating to CU registration.  
This is where the [CU registration](../../processes/controllable-unit-registration.md)
process starts.

## 2. Look up the controllable unit

Before creating a new controllable unit, ensure that it does **not** already
exist in the register by performing the [CU lookup](../../processes/controllable-unit-lookup.md)
process.

This process also confirms that the accointing point belongs to the end user.
The end user ID is required in order to prevent unauthorized use of the lookup function.

## 3. Check if the controllable unit already exists

Inspect the list of CUs at the accounting point:

* If the CU does **not** appear → proceed to `Create a new controllable unit`.
* If the CU **does** appear → the CU is already registered.  
  *If the CU is receiving a new contract to switch service provider, follow the
  [service provider switching process](../../processes/service-provider-switching.md).*

## 4. Create a new controllable unit

Create a new controllable unit and provide the required information as described
in the portal.

>[!NOTE]
>
>The information required supports several processes:
>
>* [Grid validation](../../processes/controllable-unit-registration.md):
> It enables the system operator to assess whether the CU can operate safely
> within the grid.
>* [SPG registration](../../processes/service-provider-registration-and-approval.md):
> It ensures that the CU can be correctly linked to a service providing group (SPG),
> which determines how the CU will participate in flexibility markets.
>* [SPG product application](../../processes/service-provider-product-application.md):
> It influences the prequalification application for the SPG,
> since the technical characteristics of the CU affect the overall
> delivery potential of the group.

## 5. Add reference to the end‑user contract

The [contract reference](../../resources/controllable_unit_service_provider.md)
between the service provider and the end user needs to be registered.

The contract establishes the service provider’s right to control the CU and
functions as the authorization mechanism within the register. This enables the
service provider to manage the CU in the system.

> [!NOTE]  
> It is not possible ta add contracts with start dates in the future.

## 6. Add technical resources

The next step is to add [technical resources](../../resources/technical_resource.md),
which represent the assets that the controllable unit consists of.

A controllable unit may contain several technical resources, and each must be
added individually in the portal.

>[!NOTE]
>Registering these resources is important because:
>
>* It provides the technical details needed by procuring system operators when
>performing product pre‑qualification.
>* It enables more efficient evaluation when different CUs contain identical or
>similar technical resources.

## 7. Activate the controllable unit

The controllable unit is now registered in the FIS, but it is only visible for the
SP that has registered it because it has not been activated.

Review all information to ensure everything is correct before activating the
the controllable unit.

When a controllable unit is activated, the connecting system operator is notified.
The connecting system operator will grid validate the controllable unit.

The system operator sets a grid validation status and the service provider is notified
of the status. The status is registered on the controllable unit.

## Next step: Grouping controllable units in a service providing group

Once the CU is registered, it can be added to a service providing group (SPG).

[!NOTE]
>A grid validation can sometimes be dependant on the total formation of a service
>providing group. It is therefore possible to create a service providing group and
>add the controllable units to the group before the controllable units are activated
and/or validated.

→ Continue with [the guide on grouping CUs](sp-spg-registration.md).
