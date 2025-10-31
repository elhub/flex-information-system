# Controllable Unit and Service Providing Group

## What is a controllable unit?

A *controllable unit* (CU) is a unit in the power system that can be
actively controlled - either because it produces electricity or because it
consumes it in a flexible way.

A CU can be:

* A power-generating module, like a power plant or a wind farm (anything that
generates electricity).

* A demand unit, meaning an electrical installation (for example, in a
factory or building) whose consumption can be actively managed - for instance,
increased or reduced when needed.

* An energy storage system - such as a battery, which can both
  consume and produce electricity, depending on its mode of operation.

### Connection to an accounting point

In FIS, each controllable unit is connected to a single accounting point.  
This ensures an unambiguous link between the CU and the balance responsible
party (BRP) of the associated energy supplier (ES), which enables imbalance
adjustment and settlement.

The accounting point also determines the locational information of the CU,
allowing system operators (SOs) to identify where flexibility can be activated
in the grid.

## A service providing group is a collection of controllable units

A *service providing group* (SPG) is a collection of controllable units (CUs),
that are grouped together within a scheduling area by a service provider (SP) to
deliver certain services (like balancing or congestion management).

!!! info "CU and SPG definitions in the Network Code on Demand Response (NCDR)"

    The explanations above are based on the NCDR, where the following definitions apply:

    Article 2:
    (21) 'controllable unit' or 'CU' means a single power-generating module and/or demand unit pursuant to Article 2(5) of
    [RfG NC 2.0] and Article 2(4) of [DC NC 2.0];

    (26) 'service providing group' or 'SPG' means an aggregation of controllable units or service providing units connected
    to more than one connection agreement point within the same scheduling area. SPG is defined by the service provider
    to provide balancing or local services;
   
    The NCDR also includes a definition of a 'service providing unit' (SPU) as a single unit connected to one connection
    agreement point. In FIS, a SPU is treated as an SPG where all CUs are connected to the same connection point.

    Find the current version of the network code here: [Network Code on Demand Response](../index.md#network-code-on-demand-response-nc-dr).

## Example with EV smart charges

The diagram below illustrates how CUs and a service
providing group are related in the context of EV smart charging.

Each charging site represents a CU. All chargers at the same site are connected
behind the same grid connection point and are operated under a common control
module. These chargers are the technical resources that make up the CU.

Several such CUs can then be grouped by a SP to form a SPG. The SPG acts as the
interface between the SP and the SO, offering services such as balancing or
congestion management.

In the example, each CU (charging site) can respond individually to control signals,
while the SPG coordinates all sites to deliver a joint service to the power system.

![SPG hierarchy NCDR](../diagrams/spg_cu_ev_example.png)

## Relevant resources in the API

The terms controllable unit, service providing group, and technical resource
correspond to specific resource types in FIS.

See the individual resource descriptions for detailed data structure and field definitions:

* [Controllable Unit](../resources/controllable_unit.md)
* [Service Providing Group](../resources/service_providing_group.md)
* [Technical Resource](../resources/technical_resource.md)
