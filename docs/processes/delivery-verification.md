# Delivery verification

This process describres the [verification](../concepts/time-series.md#verification)
of a delivered flexibility service and how it relates to the flexibility
information system (FIS).

Is the delivery verification result registered in the FIS? Can FIS hold overview
of when/which verifications have been done?

The verification analysis requires time series at an SPG level. These time series
are/are not located in the FIS and/but they relate to the CU and SPG IDs in the
FIS. The time series needed for the verificaion are:

* Metering values
* Baseline
* Bid volume

The metering values are stored in a metering database (MDB) where SP continuously
sends the metering values of its CUs/SPGs. If the metering values are stored at
CU level, they are aggregated to SPG level by SP.

The baseline is stored at a baseline source. SP sends/collects the baseline
to/from the source.

The bid volume is collected by SO when the bid is accepted. Alt. from the
marketplace.

The delivery verification is done by a procuring system operator that has activated
a bid from the service provider.

## Prerequisites

* An activation of the SPG has been done.
* SP sends metering values to the MDB continuously

## Sequence

[Full Size](../diagrams/delivery-verification.png) | [PlantUML description](../diagrams/delivery-verification.plantuml)

![Controllable Unit Update](../diagrams/delivery-verification.png)


