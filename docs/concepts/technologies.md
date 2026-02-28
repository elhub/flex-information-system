# Resources and technologies

The system operator that is procuring services needs to know the "technologies"
that [controllable units](./conceptual-model.md#what-is-a-controllable-unit) and
[service providing groups](./conceptual-model.md#a-service-providing-group-is-a-collection-of-controllable-units)
consists of. This is to aid the system operator in evaluating the resources.

The [Network Code on Demand
Response](../index.md#network-code-on-demand-response-nc-dr) (NCDR) has
provisions regarding this, even tho a fundamental principle is "technology
neutrality". There are multiple provisions that require a flexibility
information system to be able to store and distribute information on the
technologies of the resources, for example (our emphasis in bold):

* "whilst having due regard to the **particularities** of demand response, energy
  storage, distributed generation and demand curtailment" - Article 3
* "the procuring system operator in coordination with the service provider shall
  [...] evaluate its **technical characteristics** in comparison with the
  corresponding product requirements" - Article 20
* "controllable units that are **identical** to controllable units [...] previously
  prequalified by any SP for the relevant product [...] the procuring system
  operator shall simplify the evaluation" - Article 20
* "make public a non-confidential version of the flexibility information system
  including at least data on the service providers and the total capacity
  prequalified or verified **per technology**" - Article 26
* "Rules for market-based procurement [...] shall take into account
  **particularities of the different resources**" - Article 32

## Devices for detecting duplicates

Information about the technology can aid in avoiding duplicate registrations of
specific resources. But, a more robust ways of avoiding duplicates is to
register uniquely identifiable devices, such as inverters, chargers etc. with
serial numbers. To do that, we must register a minimum of information about the
device.

* **Type** - The type of device, such as `inverter`, `hvac`, `evcharger`
* **Make** - The manufacturer.
* **Model** - well... the model
* **Unique identifier** - E.g. a serial number or MAC address of the device.
* **Maximum active power** - "Merkeeffekt" for prequalification and statistical purposes.

### Case - hybrid inverters

Consider a consumer with a solar panel and a battery. This consumer can have one
of the following setups:

* AC-coupled: the solar panel and battery are connected to the grid through
  separate inverters. Both inverters can be controlled as a unit, but they are
  technically separate resources.
* DC-coupled: the solar panel and battery are connected to the grid through the
  same, hybrid, inverter.

If the inverter is the thing that is registered, then it will be challenging to
set one "technology" for the device. This calls for it being possible to set
multiple technologies per device?

## Technologies and categories

On the highest level, there is a need to categorise controllable units into
three main categories. The reason for this is.

* In Norwegian balancing markets, each service providing group must only contain
  one of these categories.
* Statistical purposes.

The categories are are.

| Statnett (EN)  | Statnett (NO) | NCDR name      | Emoji |
|----------------|---------------|----------------|-------|
| consumption    | forbruk       | demand         | 🏠    |
| production     | produksjon    | generation     | ⚡     |
| energy storage | energilager   | energy storage | 🔋    |

We believe that rather than registering the categories themselves, we can
register the underlying technologies, and derive the category from them.

This will make the registration very specific for service providers as they only
have to register "what they have". It also makes the data more valuable as we
can get more insight into what technologies are being utilised.

Technologies can be categorized in a hierarchy. The hierarchy is inspired by
[Standard for næringsgruppering (SN)](https://www.ssb.no/klass/klassifikasjoner/6).
We want to use the same approach as SSB is taking with SN.

1. Breaking down into smaller subtechnologies only when it is actually relevant
   for some purpose.
2. Classifying based on the _main technology_ (ref. "viktigste aktivitet" in SN)

We have used emojois to indicate the categories. When registering resources that
are not covered by the classification, the service provider can use the "other"
technologies. By monitoring the use of these, we can learn more about the
technologies that are not yet covered, and decide if they should be added as new
technologies.

* Hydropower ⚡
    * Pumped 🔋
    * Run-of-river ⚡
* Heat power plant ⚡
    * Combined heat and power (CHP) ⚡
* Solar ⚡
* Wind ⚡
* Backup generator ⚡
* HVAC 🏠
* Lighting 🏠
* Hot water heater 🏠
* Boiler 🏠
* Electric vehicle charger 🏠
    * Vehicle to grid (V2G) 🔋
* Battery 🔋
* Other consumption 🏠
* Other production ⚡
* Other energy storage 🔋

> [!NOTE]
>
> We want to avoid registering specific technologies for things that should
> rather be based on other information elements. A couple of examples are:
>
> * EV chargers - distinguishing between home and fast chargers should be based
>   on the maximum active power and/or accounting point consumption type, not the
>   technology.
> * Hydropower - having specific "technologies" for small-, mini- and micro-hydro.

## Where is regulation and energy direction stored?

The regulation direction (up/down) does not have to be stored on each device. It
is the overall regulation direction of the controllable unit that is relevant.
It is therefore stored on the [controllable unit
itself](../resources/controllable_unit.md#field-regulation_direction).

The energy direction to and from the grid is already available on the accounting
point. See [below](#accounting-point-information). Some information about the
energy direction can also be derived from the technology and category.

## Technology is stored on the lowest level

A design goal of the flexibility information system is to only store information
once, and then compile or compose that information to the other levels. The
levels refer to the [conceptual model](./conceptual-model.md).

The service provider must register technical resources of the controllable unit.
Each technical resource is registered as a technology. The category is then
derived from the technology.

This approach has several advantages:

* allows for registering controllable units with multiple technologies, such as
  smart homes (water heater, electric vehicle, heat pump) or data centers
  (battery, backup generator, other consumption)
* simpler for service provider to register since they only need to know the
  technology, not how to categorize it
* deriving the category on both CU and SPG level is possible
* monitoring and reporting statistics on the use of different technologies in
  the market can be done

In addition to this information stored by the service provider, we can also use
information about the accounting point to understand more about the flexibility
resource.

## Accounting point information

All controllable units are connected to accounting points. The Norwegian Datahub
Elhub has information about the energy direction of the accounting point as well
as consumption/production types.

* [Metering Point Type](https://dok.elhub.no/e27/referansedata-for-malepunkttype)
  i.e. energy direction
* [Production Type](https://dok.elhub.no/e27/referansedata-for-produksjonstype)
* [Consumption Type](https://dok.elhub.no/e27/referansedata-for-forbrukstype)

For consumption, Elhub also has information about the consumer, such as
[NACE and Consumption code Code](https://dok.elhub.no/e27/retningslinjer-for-nrings-og-forbrukskode).

## Example

Datacenter accounting point could look like this.

* Metering Point Type: Consumption
* Consumption Type: Consumption
* NACE code: 63.100 - Data processing, hosting and related activities
* Controllable unit
    * Derived technology categories: Consumption, Production, Energy storage
    * Maximum active power: 100 kW
    * Regulation direction: Both
    * Technical resources
        * Technology: Battery
        * Technology: Backup generator
        * Technology: Other consumption
