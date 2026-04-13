# Accounting point grid location

This document shows how location for accounting points are handled in the
flexibility register. The location is used in the [grid-model
use-cases](../concepts/grid-model.md).

Grid location means the *electrical* or *topological* location in the grid. This
is different from the geographical location, given as coordinates or address.

Since a controllable unit is always "behind" an accounting point, the grid
location on accounting point will give the location for the CUs as well.

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
substation does not have a kind, then it is a child substation.

* coupling
* junction
* power - kraftverk
* transformer

A child substation will also have a foreign key to its parent substation.

The following fields exist on the substation resource

| Field name                 | Description                                              | Nullable | Example                                   | Note                  |
|----------------------------|----------------------------------------------------------|----------|-------------------------------------------|-----------------------|
| id                         | Surrogate identifier                                     | no       | 1234                                      |                       |
| name                       | Name of the substation.                                  | no       | Snilldal 1                                |                       |
| business_id                | Business identifier for the substation - mRID            | no       | 1234                                      |                       |
| business_id_type           | Type of business identifier. Just `uuid`                 | no       | uuid                                      |                       |
| kind                       | Kind of substation.                                      | yes      | coupling                                  |                       |
| substation_id              | Foreign key to parent substation.                        | yes      | 1234                                      |                       |
| longitude                  | Longitude of the substation.                             | yes      | 10.1234                                   | Center for parent     |
| latitude                   | Latitude of the substation.                              | yes      | 63.1234                                   | Center for parent     |
| voltage_levels             | List of voltage levels on the substation and parent. kV. | yes      | [22, 33]                                  | Extracted BaseVoltage |
| consessionaire             | Name of the main consessionaire for the substation.      | yes      | TrønderEnergi Nett                        |                       |
| consessionaire_business_id | Org number for the main consessionaire.                  | yes      | 123456789                                 |                       |
| geometry                   | For displaying on a map. GeoJSON Polygon or Point.       | yes      | See [GeoJSON Geometry](#geojson-geometry) |                       |

### line

| Field name                 | Description                                      | Nullable | Example                                   | Note                  |
|----------------------------|--------------------------------------------------|----------|-------------------------------------------|-----------------------|
| id                         | Surrogate identifier                             | no       | 1234                                      |                       |
| name                       | Name of the line.                                | no       | Snilldal 1                                |                       |
| business_id                | Business identifier for the line - mRID          | no       | 1234                                      |                       |
| business_id_type           | Type of business identifier. Just `uuid`         | no       | uuid                                      |                       |
| voltage_level              | Voltage level on the line. kV.                   | no       | 22                                        | Extracted BaseVoltage |
| from_substation_id         | Foreign key to the substation the line starts at | no       | 1234                                      |                       |
| to_substation_id           | Foreign key to the substation the line ends at   | no       | 1234                                      |                       |
| consessionaire             | Name of the main consessionaire for the line.    | yes      | TrønderEnergi Nett                        |                       |
| consessionaire_business_id | Org number for the main consessionaire.          | yes      | 123456789                                 |                       |
| geometry                   | For displaying on a map. GeoJSON LineString.     | yes      | See [GeoJSON Geometry](#geojson-geometry) |                       |

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

> [!INFO]
>
> The Point geometry should probably use pins for location. That allows us to
> use different colors and icons/letts for different kinds of substations.

## Location = Substation + Voltage level

When a grid owner registers the electrical location of an accounting point, they
will give us the substation and the voltage level. These are fields on the
accounting point.

* `substation_id` - the id of the substation
* `substation_voltage_level` - voltage level in kV

### Voltage level standardisation

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
