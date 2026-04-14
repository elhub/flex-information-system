# Accounting point grid location

This document shows how location for accounting points are handled in the
flexibility register. The location is used in the [grid-model
use-cases](../concepts/grid-model.md).

Grid location means the *electrical* or *topological* location in the grid. This
is different from the geographical location, given as coordinates or address.

Since a controllable unit is always "behind" an accounting point, the grid
location on accounting point will give the location for the CUs as well.

## Accouting point geographical location

The accounting point geographical location is loaded as part of the [accounting
point data sync](../accounting-point-data-sync.md). This location is used for
displaying the accounting point on a map to visually aid the DSO in picking the
right grid location.

Since we also know the geographical location of the different parts of the grid
model, we can also use the geographical location of the accounting point to make
an educated guess on the grid location.

## Common grid model as reference

The grid location of accounting points is used to facilitate collaboration and
coordination between grid owners on different levels. An example is that a
regional or transmission system operator needs to know the grid location of a
controllable unit connected in a distribution system operators grid to be able
to assess if activation of flexibility services will compromise safe operation
of their grid.

To be able to communicate efficently, both the connecting and impacted/procuring
system operator must have a common reference - a common grid model that they can
use to communicate location.

This also means that each system operator must have a mapping or connection from
their individual grid model to a common grid model.

The Norwegian common grid model is [Nemo](https://nemo.elbits.no/modell/) from
[Elbits](https://www.elbits.no/).

Nemo is used by [Tilko](https://www.elbits.no/tjenester/tilko), a digital portal
for grid connection requests that affects more than one grid owner. Tilko has
been rolled out to allmost all of Norway as of writing this. We are taking a lot
inspiration from Tilko in how we exchange grid location.

## Condensed data model

We model two resources in our system, based on Nemo.

* `substation` from `Substation` and `SubstationPart`
* `line` from `Line`

### substation

The `substation` resource is modelling
[elb:SubstationPart](https://nemo.elbits.no/modell/Dokumentasjon/substationpart/)
and [cim:Substation](https://nemo.elbits.no/modell/Dokumentasjon/substation/) as
a single resource. This is based on a understanding that the substationpart as a
name/concept will not be used in future versions of a common grid model.

We use substation kind and a foreign key to distinguish between the two. If the
substation does not have a kind, then it is a child substation. A child
substation will also have a foreign key to its parent substation.

The following fields exist on the substation resource

| Field name             | Description                                                               | Nullable | Example                                   | Note                       |
|------------------------|---------------------------------------------------------------------------|----------|-------------------------------------------|----------------------------|
| id                     | Surrogate identifier                                                      | no       | 1234                                      |                            |
| name                   | Name of the substation.                                                   | no       | Snilldal 1                                |                            |
| business_id            | Business identifier for the substation - mRID                             | no       | 1234                                      |                            |
| business_id_type       | Type of business identifier. Just `uuid`                                  | no       | uuid                                      |                            |
| kind                   | Kind of substation. One of `coupling`, `junction`, `power`, `transformer` | yes      | coupling                                  |                            |
| substation_id          | Foreign key to parent substation.                                         | yes      | 1234                                      |                            |
| longitude              | Longitude of the substation.                                              | yes      | 10.1234                                   | Center for parent          |
| latitude               | Latitude of the substation.                                               | yes      | 63.1234                                   | Center for parent          |
| nominal_voltage_levels | List of voltage levels on the substation and parent. kV.                  | yes      | [22, 33]                                  | Extracted from BaseVoltage |
| consessionaires        | Name and org number of the main consessionaires.                          | yes      | ["SønderEnergi Nett (987654321)"]         |                            |
| geometry               | For displaying on a map. GeoJSON Polygon or Point.                        | yes      | See [GeoJSON Geometry](#geojson-geometry) |                            |

### line

| Field name           | Description                                      | Nullable | Example                                   | Note                       |
|----------------------|--------------------------------------------------|----------|-------------------------------------------|----------------------------|
| id                   | Surrogate identifier                             | no       | 1234                                      |                            |
| name                 | Name of the line.                                | no       | Snilldal 1                                |                            |
| business_id          | Business identifier for the line - mRID          | no       | 1234                                      |                            |
| business_id_type     | Type of business identifier. Just `uuid`         | no       | uuid                                      |                            |
| from_substation_id   | Foreign key to the substation the line starts at | no       | 1234                                      |                            |
| from_nominal_voltage | Voltage level on the line. kV.                   | no       | 22                                        | Extracted from BaseVoltage |
| to_substation_id     | Foreign key to the substation the line ends at   | no       | 1234                                      |                            |
| to_nominal_voltage   | Voltage level on the line. kV.                   | no       | 22                                        | Extracted from BaseVoltage |
| consessionaires      | Name and org number of the main consessionaires. | yes      | ["SønderEnergi Nett (987654321)"]         |                            |
| geometry             | For displaying on a map. GeoJSON LineString.     | yes      | See [GeoJSON Geometry](#geojson-geometry) |                            |

### GeoJSON Geometry

We are storing a [GeoJSON
geometry](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1) for both
substations and lines. This is for displaying the grid model on a map.

This is how we derive the geometry.

| Nemo type      | Geometry type | Description                                                                                               |
|----------------|---------------|-----------------------------------------------------------------------------------------------------------|
| SubstationPart | Point         | We use the Location of the SubstationPart.                                                                |
| Substation     | Polygon       | The convex hull of the Location of the SubstationParts, with a fixed buffer.                              |
| Line           | LineString    | Line from center to center of to/from Substations. Center is the average of the SubstationPart locations. |

This allows us to display the three things. Shown in the example below. The
example shows two main substations. One has three childs and a few connecting
lines. The other one has just one and no connections. This should of course be
displayed on top of a map.

![NEMO display](../diagrams/nemo-display.png)

> [!NOTE]
>
> The Point geometry should probably use pins for location. That allows us to
> use different colors and icons/letters for different kinds of substations. See
> example below.

## Location = Substation + Voltage level

The grid owners registers the electrical grid location of an accounting point.
The information is given in a dedicated resource
`accounting_point_grid_location` containing the following fields.

> [!NOTE]
>
> Note that transformer is part of the location but not discussed above. We are
> still debating if/when transformers should be part of the grid location.

* `substation_name` - the name of the substation - free text
* `substation_business_id` - the business ID (mRID) of the substation,
  referencing NEMO
* `transformer_name` - the name of the transformer - free text
* `transformer_business_id` - the business ID (mRID) of the transformer,
  referencing NEMO
* `nominal_voltage` - voltage level in kV
* `additional_information` - free text field
* `determined_by` - Who the grid location was
  determined by. One of `cso`, `iso`, `system`
* `quality` - the quality of the grid location
  registration - One of `confirmed` or `guessed`

Registering the grid location of the accounting point is done by system
operators. The connecting system operator (CSO) is responsible for registering
and updating the grid location.

A PSO can also register the grid location, but only if it is missing or the
current information is determined by system or by impacted system operator
(ISO).

The system will guess the grid location based on the geographical location of
the accounting point and the grid model. The system will only guess the grid
location if it is missing or the current information is determined by system.

## Guessing grid location

Since we know the geographical location of the accounting point and substations,
we can make an educated guess on the grid location.

The first implementation just pick the closest. But we assume that we will
create more elaborate strategies once we see it in action.

## Example user interface

This shows an example of how the grid location UI can be in a flexibility register.

![Grid location UI](../diagrams/grid-location-ui.drawio.png)

## Voltage level standardisation

Voltage levels in Nemo are all-over-the-place. For simpler user interaction, we
might want to standardise voltage levels. The way we do it it is by combining
ranges into a single nominal voltage level. The following table shows the
thresholds and which nominal voltage level it maps to. If a voltage level equal
or higher than a threshold, and lower than the next, then it maps to the given
nominal voltage. All voltages are given as as kilovolt (kV).

| Threshold | Nominal |
|-----------|---------|
| 0         | 0.23    |
| 0.34      | 0.4     |
| 0.6       | 0.69    |
| 0.8       | 1       |
| 2         | 3.3     |
| 4         | 5       |
| 5.5       | 6.6     |
| 8         | 11      |
| 12        | 15      |
| 18        | 22      |
| 27        | 33      |
| 40        | 47      |
| 55        | 66      |
| 80        | 110     |
| 120       | 132     |
| 200       | 300     |
| 350       | 420     |

This topic is still up for discussion.
