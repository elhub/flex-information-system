# Delivery verification

This process describres the [verification](../concepts/time-series.md#verification)
of a delivered flexibility service and how it relates to the flexibility
information system (FIS).

[!NOTE]

>This is a general description of how a delivered service can be verified. The detailed
>requirements for the time series required for the analysis (e.g. the requirements
>for time resolution) should be defined in the product-specific requirements.

The delivery verification is done by a procuring system operator (PSO) that has
activated a bid from the service provider (SP). The verification is done at an
SPG level because the service is delivered at the SPG level. The verification
analysis thus requires time series at an SPG level.

## Required time series

The time series needed for the verificaion are:

* Metering values
* Baseline
* Bid volume

The metering values and baseline are available through the time series service
design. There is an [integration](../technical/time-series-design.md#integration)
between the time series service and FIS, where FIS references the time series by
ID and holds authorization information.

SP continuously sends _metering values_ of its CUs to the time series service.
The CUs are then aggregated BY SOMEONE (må oppdateres) to the SPG level. The IDs
of the time series can be matched with the IDs of the CUs and SPGs registered in
the FIS.

The metering values from the smart meter connected to the accountig point are sent
continuously to Elhub by the SO. These values are available at D+1 07:00 and are
available through the time series service.

The _baseline_ is sent by SP after a bid is offered in the marketplace, before
the bid is accepted. The baseline is sent at an SPG level. The baseline is
accessible through the time series service after the bid has been activated.

The time series for the _bid volume_ is collected by SO when they accept the bid.
Therefore the bid does not need to be available through the time series service.
The bid volume is given at an SPG level.

## Time resolution

In most cases, a 15-minute time resolution will be sufficent to verify that the
delivered volume was equal to the bid volume. However, if the analysis also
contains a verification of the quality of the delivery, more granulated data
will usually be required.

## Prerequisites

* PSO has the time series for the bid

## Sequence

[Full Size](../diagrams/delivery-verification.png) | [PlantUML description](../diagrams/delivery-verification.plantuml)

![Controllable Unit Update](../diagrams/delivery-verification.png)
