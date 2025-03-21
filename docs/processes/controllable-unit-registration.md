# Controllable Unit Registration

This process describes the registration of a controllable unit (CU) in the
flexibility register as a Service Provider. It also includes grid validation for
the system operator to validate the information provided.

A CU is considered new until the status is changed to active.
Once grid validation is requested, any changes to the CU is considered an
update, and handled by the update process. Grid validation on the CU level
is done by the connecting system operator.

The connecting system operator will during the validation process be able to
inform SP about missing details.

## Prerequisites

* Controllable Unit does not exist in the flexibility information system
* Service Provider knows the metering point id of the accounting point for the
  controllable unit
* Flexibility Information System knows
    * the system operator and end user of all metering points (from Elhub)
    * mapping of grid nodes in local markets to grid nodes in transmission
      system operator markets
* There is no national grid model that includes all metering point ids. Requires
  system operator to map metering points to grid nodes.

## Sequence

[Full Size](../diagrams/controllable_unit_registration.png) | [PlantUML description](../diagrams/controllable_unit_registration.plantuml)

![Controllable Unit Registration](../diagrams/controllable_unit_registration.png)
