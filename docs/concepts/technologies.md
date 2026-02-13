# Resources and technologies

The system operator that is procuring services needs to know the technologies
that [controllable units](./conceptual-model.md#what-is-a-controllable-unit) and
[service providing groups](./conceptual-model.md#a-service-providing-group-is-a-collection-of-controllable-units)
consists of.

The [Network Code on Demand
Response](../index.md#network-code-on-demand-response-nc-dr) (NCDR) has provisions
regarding this, even tho a fundamental principle is technology neutrality. There
are many provisions that require a flexibility information system to be able to
store and distribute information on the technologies of the resources, for
example (our emphasis in bold):

* "whilst having due regard to the **particularities** of demand response, energy
  storage, distributed generation and demand curtailment" - Article 3
* "controllable units that are **identical** to controllable units [...] previously
  prequalified by any SP for the relevant product [...] the procuring system
  operator shall simplify the evaluation" - Article 20
* "make public a non-confidential version of the flexibility information system
  including at least data on the service providers and the total capacity
  prequalified or verified **per technology**" - Article 26
* "Rules for market-based procurement [...] shall take into account
  **particularities of the different resources**" - Article 32

In addition to this, information about the technology can aid in avoiding
duplicate registrations of specific resources.

## Technologies and categories

For different purposes, the level of detail needed might vary. When establising
rules and regulations, we might want to work with coarser categories of
technologies, but while assessing if a controllable unit is identical, we must
know a lot more details.

Common categories of technologies found in Statnett markets and in the NCDR are.

| Statnett (EN)  | Statnett (NO) | NCDR           |
|----------------|---------------|----------------|
| consumption    | forbruk       | demand         |
| production     | produksjon    | generation     |
| energy storage | energilager   | energy storage |

Technologies can be categorized according to the following table.

| Technology (EN) | Technology (NO)   | Category         | Notes |
|-----------------|-------------------|------------------|-------|
| heat            | varme             | consumption      |       |
|                 | elbil             | consumption      |       |
|                 | elbil med V2G     | energy storage?? |       |
| boiler          | elkjel            | consumption      |       |
| water heater    | varmtvannsbereder | consumption      |       |
| solar panel     | solcelle          | production       |       |
| wind turbine    | vindturbin        | production       |       |
| hydro           | vannkraft         | production       |       |
| battery         | batteri           | energy storage   |       |
| pumped storage  | pumpekraftverk    | energy storage   |       |
| pump            | pumpe             | consumption      |       |

When registering resources that are not covered by the table above, new
technologies can be defined as needed. But we should provide the possibility to
register default technologies that are not further specified:

* `other consumption`
* `other production`
* `other energy storage`

By monitoring the use of these, we can learn more about the technologies that
are not yet covered by the table, and decide if they should be added as new
technologies.

## Information on different logical levels

A design goal of the flexibility information system is to only store information
once, and then compile or compose that information to the other levels.

### Accounting point information

All controllable units are connected to accounting points. The Norwegian Datahub
Elhub has information about the energy direction of the accounting point as well
as consumption/production types.

* [Metering Point
  Type](https://dok.elhub.no/e27/referansedata-for-malepunkttype) - i.e. energy
  direction
* [Production Type](https://dok.elhub.no/e27/referansedata-for-produksjonstype)
* [Consumption Type](https://dok.elhub.no/e27/referansedata-for-forbrukstype)
