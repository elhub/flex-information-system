# Controllable Unit Lookup

This process is used to look up information on controllable units before
initiating controllable unit registration or service provider switching.

Before starting the CU registration or switching process, the service provider
needs to verify the linkage between the end user and the accounting point / CU, as
well as validate CU data. This process retrieves the necessary information from
FIS, to ensure that the service provider has sufficient data to determine the
appropriate process to execute.

To prevent unauthorized use, FIS requires the end user id for the service
provider to access CU data.

## Prerequisites

- Service provider has a consent from the end user to request data on the
  accounting point / CU.
- Service provider knows the end user id and other key information about
  accounting point / CU.
- CU ID provided from FIS must be used in service provider switching.

## Sequence

[Full Size](../diagrams/controllable_unit_lookup.png) | [PlantUML description](../diagrams/controllable_unit_lookup.plantuml)

![Controllable Unit Registration](../diagrams/controllable_unit_lookup.png)
