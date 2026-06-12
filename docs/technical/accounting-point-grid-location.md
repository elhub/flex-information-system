# Accounting point grid location

This document shows how location for accounting points are handled in the
flexibility register. The location is used in the [grid-model
use-cases](../concepts/grid-model.md).

Grid location means the *electrical* or *topological* location in the grid. This
is different from the geographical location, given as coordinates or address.

> [!NOTE]
> Since a controllable unit is always "behind" an accounting point, the grid
> location on accounting point will give the location for the CUs as well.

## Accounting point geographical location

The accounting point geographical location is loaded as part of the [accounting
point data sync](./accounting-point-data.md). This location is used for
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

To be able to communicate efficiently, both the connecting and impacted/procuring
system operator must have a common reference - a common grid model that they can
use to communicate location.

This also means that each system operator must have a mapping or connection from
their individual grid model to a common grid model.

The Norwegian common grid model is [Nemo](https://nemo.elbits.no/modell/) from
[Elbits](https://www.elbits.no/).

Nemo is used by [Tilko](https://www.elbits.no/tjenester/tilko), a digital portal
for grid connection requests that affects more than one grid owner. We are
taking a lot inspiration from Tilko in how we exchange grid location.

### Common grid model basics

The Nemo model is modelled in [Resource Description Framework
(RDF)](https://no.wikipedia.org/wiki/Resource_Description_Framework), allowing
for a representation of a graph as a set of triples.

The main objects are

* [SubstationCluster](https://nemo.elbits.no/modell/Dokumentasjon/substation/) :
  the "main" station - hovedstasjon (previously called `Substation`)
* [Substation](https://nemo.elbits.no/modell/Dokumentasjon/substationpart/) : a
  part of a substation cluster - understasjon (previously called `SubstationPart`)
* [Line](https://nemo.elbits.no/modell/Dokumentasjon/line/) : grid connections
  between substation clusters

An important field on these objects are their unique business identifiers -
mRID. mRID is the [Master resource identifier issued by a model
authority](https://ontology.tno.nl/cerise/cim-profile/cim_IdentifiedObject.mRID.html),
in this case Elbits/Nemo. This unique identifier allows us to reference the
objects in the common grid model.

### Accounting points in grid model

Work is ongoing to add accounting points to the common grid model. This will be
done in one of two ways:

* combining the individual grid models of TSO and DSO and traversing the grid to
  set location
* DSOs doing the mapping in their NIS and exporting the grid location directly
  for inclusion in the common grid model

Once this is in place, this will become the authoritative source of grid
location for accounting points. It is assumed that the information will be added
gradually - system operator by system operator.

Accounting points will point to the most specific point in the grid model as
possible. This could be a substation, transformer or feeder.

The flow of information can be visualised as follows.

![Grid model data flow](../diagrams/grid-model-data-flow.drawio.png)

## Grid model service

Grid model data will be made available as its own service in the flexibility register.
The grid model service will serve data as an aid in picking the grid location.

We model a condensed data model with the following resources in this service,
based on Nemo.

* `substation_cluster` from `SubstationCluster`
* `substation` from `Substation`
* `line` from `Line`

### substation_cluster

The `substation_cluster` resource models
[SubstationCluster](https://nemo.elbits.no/modell/Dokumentasjon/substation/)
(previously called `Substation`) — the "main" station (hovedstasjon).

| Field name        | Description                                       | Format          | Example                                   | Nullable |
|-------------------|---------------------------------------------------|-----------------|-------------------------------------------|----------|
| id                | Surrogate identifier                              | Integer         | 1234                                      | no       |
| name              | Name of the substation cluster.                   | Free text       | Snilldal                                  | no       |
| business_id       | Business identifier - mRID                        | UUID            | 550e8400-e29b-41d4-a716-446655440000      | no       |
| business_id_type  | Type of business identifier.                      | `uuid`          | uuid                                      | no       |
| averaged_position | The average geographical position of the cluster. | GeoJSON Point   | See [GeoJSON Geometry](#geojson-geometry) | no       |
| area              | For displaying on a map.                          | GeoJSON Polygon | See [GeoJSON Geometry](#geojson-geometry) | no       |

### substation

The `substation` resource models
[cim:Substation](https://nemo.elbits.no/modell/Dokumentasjon/substationpart/)
(previously called `SubstationPart`) — a part of a substation cluster
(understasjon). Each substation belongs to exactly one substation cluster via
`substation_cluster_id`.

| Field name             | Description                                     | Format                                         | Example                                   | Nullable |
|------------------------|-------------------------------------------------|------------------------------------------------|-------------------------------------------|----------|
| id                     | Surrogate identifier                            | Integer                                        | 1234                                      | no       |
| name                   | Name of the substation.                         | Free text                                      | Snilldal 1 KRA                            | no       |
| business_id            | Business identifier - mRID                      | UUID                                           | 550e8400-e29b-41d4-a716-446655440000      | no       |
| business_id_type       | Type of business identifier.                    | `uuid`                                         | uuid                                      | no       |
| kind                   | Kind of substation                              | `coupling`, `junction`, `power`, `transformer` | coupling                                  | no       |
| primary_concessionaire | Name and org number of the main concessionaire. | text                                           | SønderEnergi Nett (987654321)             | no       |
| substation_cluster_id  | Foreign key to parent substation cluster.       | Integer                                        | 1234                                      | no       |
| voltage_levels         | List of voltage levels on the substation.       | Array of numeric. kV with three decimals.      | [22, 33]                                  | no       |
| position               | For displaying on a map.                        | GeoJSON Point                                  | See [GeoJSON Geometry](#geojson-geometry) | no       |

### line

| Field name                 | Description                                                            | Format             | Example                                   | Nullable |
|----------------------------|------------------------------------------------------------------------|--------------------|-------------------------------------------|----------|
| id                         | Surrogate identifier                                                   | Integer            | 1234                                      | no       |
| name                       | Name of the line.                                                      | Free text          | Snilldal-Høyeng                           | no       |
| business_id                | Business identifier for the line - mRID                                | UUID               | 123e4567-e89b-12d3-a456-426614174000      | no       |
| business_id_type           | Type of business identifier. Just `uuid`                               | `uuid`             | uuid                                      | no       |
| from_substation_cluster_id | Foreign key to the substation cluster the line starts at               | Integer            | 1234                                      | no       |
| to_substation_cluster_id   | Foreign key to the substation cluster the line ends at                 | Integer            | 1234                                      | no       |
| line                       | For displaying on a map. From-to substation cluster averaged position. | GeoJSON LineString | See [GeoJSON Geometry](#geojson-geometry) | no       |

### GeoJSON Geometry

We are storing a [GeoJSON
geometry](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1) for both
substations and lines. This is for displaying the grid model on a map.

This is how we derive the geometry.

| Nemo type         | Geometry type | Description                                                                                                  |
|-------------------|---------------|--------------------------------------------------------------------------------------------------------------|
| Substation        | Point         | We use the position of the Substation.                                                                       |
| SubstationCluster | Polygon       | The convex hull of the positions of the Substations, with a fixed buffer.                                    |
| Line              | LineString    | Line from center to center of to/from SubstationClusters. Center is the average of the Substation positions. |

This allows us to display the three things. Shown in the example below. The
example shows two main substations. One has three children and a few connecting
lines. The other one has just one and no connections. This should of course be
displayed on top of a map.

![Nemo display](../diagrams/nemo-display.png)

> [!NOTE]
>
> The Point geometry should probably use pins for position. That allows us to
> use different colors and icons/letters for different kinds of substations. See
> example below.

### Provisioning of data

We do a full load of the grid model data following the [structure data loading
mechanisms](./structure-data.md). We load using merge and update using the
automatic strategy.

Resources that we have previously loaded but is now not present in the current
load will be soft-deleted using a specific field on the resources.

## Location = Grid model reference + Voltage level

The grid owner registers the electrical grid location of an accounting point.
The location should be given as a reference to the common grid model. The
reference should also be given to the most specific point in the grid as
available.

The information is given in a dedicated resource
`accounting_point_grid_location` containing the following fields.

> [!NOTE]
>
> We are using business ids and free text names here on purpose. This is because
> we believe that in general system operators will communicate grid location
> directly, using Nemo as reference. Using FIS surrogate keys is not recommended
> in this context.

| Field name               | Description                                        | Format                              | Example                              | Nullable | Note |
|--------------------------|----------------------------------------------------|-------------------------------------|--------------------------------------|----------|------|
| `object_type`            | The type of object in the grid model               | `substation`, `transformer`         | substation                           | no       |      |
| `business_id`            | Business ID (mRID) referencing national grid model | UUID                                | 123e4567-e89b-12d3-a456-426614174000 | yes      |      |
| `name`                   | Name of the grid model object                      | Free text                           | Snilldal 1 KRA                       | no       |      |
| `nominal_voltage`        | Voltage level in kV                                | Numeric value                       | 22                                   | no       |      |
| `additional_information` | Additional information about the grid location     | Free text                           |                                      | yes      |      |
| `source`                 | Who the grid location was determined by            | `cso`, `so`, `grid_model`, `system` | cso                                  | no       |      |
| `quality`                | The quality of the grid location registration      | `confirmed`, `guessed`              | confirmed                            | no       |      |

### Location source

As seen by the `source` field in the table above, we also want to keep track of
how the grid location was determined. The enum values are as follows.

* `cso` - registered by connecting system operator (CSO)
* `so` - registered by impacted or procuring system operator
* `grid_model` - given from common/national grid model
* `system` - (guessed) by the flexibility information system

The CSO is responsible for registering and updating the grid location. This is
done directly in the flexibility register or via the national grid model.

Another system operator can also register the grid location, but only if it is
missing or the current information is determined by system or guessed by another
system operator. The purpose of this is to allow the other system operators to
improve on system-guessed location while waiting for confirmation from the CSO.

The system will guess the grid location based on the geographical location of
the accounting point and the grid model. The system will only guess the grid
location if it is missing or the current information is determined by system.

The following table shows what transitions are allowed to update the grid
location based on the current source.

| Current ↓ \ New → | `grid_model` | `cso` | `so` | `system` |
|-------------------|--------------|-------|------|----------|
| `grid_model`      | yes          | no    | no   | no       |
| `cso`             | yes          | yes   | no   | no       |
| `so`              | yes          | yes   | yes  | no       |
| `system`          | yes          | yes   | yes  | yes      |
| missing           | yes          | yes   | yes  | yes      |

The table shows that the priority order of the source is `grid_model` > `cso` >
`so` > `system`.

> [!NOTE]
>
> Note that transformer is part of the location but not discussed above. We are
> still debating if/when transformers should be part of the grid location.

## Guessing grid location

Since we know the geographical location of the accounting point and substations,
we can make an educated guess on the grid location.

The first implementation just picks the closest. But we assume that we will
create more elaborate strategies once we see it in action.

## Example user interface

This shows an example of how the grid location UI can be in a flexibility register.

![Grid location UI](../diagrams/grid-location-ui.drawio.png)
