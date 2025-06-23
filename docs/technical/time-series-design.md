# Time Series Design

This document outlines an initial design for our time series service.

## Status

Current status: **DRAFT**

## Introduction

Given our [investigations into time series data](../concepts/time-series.md), we
know that a flexibility information system needs to store and distribute time
series data. The first use cases we want to support are:

1. calculate and report imbalance settlement adjustments to eSett
2. enable end users to securely access their data in compliance with GDPR

It is not *given* that FIS will become a data administrator for timeseries other
than accounting meter data. We do not know exactly what data will flow through
FIS. This design is therefore a light-weight, general purpose starting point and
conceptual design for a time series service using our existing stack.

## Audience

This document is intended for developers and architects, but also functional
experts in the metering value and/or time series domain.

## Objectives

* a general purpose time series design
* efficient storage of time series data in PostgreSQL
    * we need to learn more about the usage patterns and functional requirements
      related to time series data before we should consider other data store(s)
    * it will also likely take quite some time before we have enough data to
      warrant a change
* decouple time series as its own service/module for easier evolvement and
  possible replacement

### Requirements

* handling of both *point* and *interval* time series
* multiple types of time series data
    * *observations* - metered and measured values
    * *forecasts* - baselines
    * *schedules* - production and consumption plans
    * *prices* - spot and balancing prices
* updateable time series - to correct errors or update baselines closer to
  the operation time
* bi-temporal storage and audit - to support corrections and reconciliation
* prevent duplication of time series - to help avoid "double registration" of
  assets in the system
* support multiple time series for the same level and origin - to allow testing
  multiple baselines concurrently
* invidual access - no current use cases for large scale aggregation or
  calculations similar to settlement jobs in Elhub

## Limitations

* The OCI PostgreSQL service does not support
  [extensions](https://docs.oracle.com/en-us/iaas/Content/postgresql/extensions.htm)
  that allow for efficient column-major storage, such as Citus and TimescaleDB.
  We are therefore forced to use the row-major storage.

### Non-Requirements

* no completeness check upon storage ("Channel Milestione" in Elhub term) -
  completeness checks will be handled by the consumer
* no period volumes

### Possible future needs

* calculations or formulas - the design should not shut out future
  calculations or formulas, but they are not in scope for the initial design

## Inspiration

* Elhub - MeteringPoint, MeasurementDefinition, IntervalVolume
* CIM - MeterReading, ReadingType, IntervalReading, MeasurementValue, Schedule
* NODES - TODO
* [Shyft](https://shyft.readthedocs.io/en/latest/content/time_series/concepts/time_series.html)
  -"*A time series in Shyft is considered to be a function of time, f(t) ->
  float.*"

## Solution description

We will leverage the existing stack and way of doing things

* PostgreSQL for storage
* PostgREST to expose our restful API, but on a new path/api
* RLS for authentication

We model the timeseries as three resources.

* `timeseries` - the time series identifier limited metadata
    * will include the external identifier for the time series, partially to avoid
      duplication of time series in the system
* `timeseries_type` - a finite set of types of time series data. To avoid
  duplication information in the `timeseries` table. The fields are the
  "attributes" of the time series, *not* their "usage". Meaningthat we will e.g.
  record the unit, but not wether it is a schedule or metered value. Something like
    * `point.Watt`
    * `interval.PT15M.Euro.Cent`
    * etc
* `timeseries_value` - the values of the time series

### API

The relevant API actions will be

* `POST /timeseries` - create a new time series metadata
* `GET /timeseries` - list all time series metadata
* `GET /timeseries/{id}` - get a specific time series metadata
* `PATCH /timeseries/{id}` - update a time series metadata
* `GET /timeseries_value?timeseries_id={id}` - list all values for a time series
* `GET /timeseries_value?timeseries_id={id}&time={time}` - get a specific value
* `POST /timeseries_value` - add a timeseries value
* `PATCH /timeseries_value?timeseries_id={id}&time={time}` - update a value for
  a time series
* `DELETE /timeseries_value?timeseries_id={id}&time={time}` - delete a value
  for a time series

### Events or distribution

We can use our existing event system, but need to figure out a way to add a
reasonable amount of events. Cannot do event-per-value.

TODO

### History for bi-temporal storage

We will use the existing history concept and our `pg_audit` package to store
historic time series data.

### Efficient storage of values

To store the time series as efficiently as possible, we can use two strategies:

* store as little as possible
* use
  [column tetris](https://stackoverflow.com/questions/2966524/calculating-and-saving-space-in-postgresql/7431468#7431468)
  to ensure efficient storage. Se also
  [On Rocks and Sand](https://www.enterprisedb.com/blog/rocks-and-sand)

The biggest saving we can have is to avoid storing time ranges both for the
valid time of the interval and record time. We only store the record time and
the valid time start as a single `tstz`.

Our `timeseries_value` table will look something like this.

| Column Name     | Type        | Nullable | Size | Description                           |
|-----------------|-------------|----------|------|---------------------------------------|
| -               | Row header  |          | 24   | -                                     |
| timeseries_id   | bigint      | No       | 8    | Unique identifier for the time series |
| time            | timestamptz | No       | 8    | The time of the value                 |
| recorded_by     | bigint      | No       | 8    | The identity that recorded the value  |
| recorded_at     | timestamptz | No       | 8    | The time the value was recorded       |
| value           | bigint      | No       | 8    | The value of the time series          |
| quality         | smallint    | Yes      | 2    | The quality of the value              |
| validation_code | smallint    | Yes      | 2    | The history id of the value           |
| estimation_code | smallint    | Yes      | 2    | Whether the value is an estimation    |
| -               | padding     |          | 2    |                                       |

At a grand total of 80 bytes per row. It does not seem like much but storing a
measly 100k timeseries with an interval of 15 over a year will take up over 260
GB of storage.

> [!INFO]
>
> A `tstzrange` — range of timestamp with time zone - uses a variable lenght of storage
> depending on the presence of the lower and upper bounds. If both bounds are present.
>
> * No bounds: 6 byte
> * Lower bound only: 14 byte
> * Upper bound only: 22 byte

Notice that we are not including an `id` column. This allows us to save 8 bytes
per row, plus avoid having the automatically created primary key index. What
will we do instead? See below.

#### Indexing and primary key

We will use a covering index on the time series table, to speed up read and
update operations. By making it a unique index we can use it as a primary key.

```sql
CREATE UNIQUE INDEX timeseries_value_pkey
ON timeseries_value (timeseries_id, time)
INCLUDE (value);

ALTER TABLE timeseries_value
ADD CONSTRAINT timeseries_value_pkey
PRIMARY KEY USING INDEX timeseries_value_pkey;
```

Why?

* Going to the heap takes time/io - including value is low overhead, but
  potentially saves a lot of time.
* Indexes take up space and time to maintain. Using one index for both
  the primary key and the covering index saves space and time.

#### Numeric vs integer

The jury is out. Int is a good choice for exactness, but numeric is good for its
`varlena` storage.

PostgreSQL docs on
[numeric](https://www.postgresql.org/docs/current/datatype-numeric.html) states

> The type numeric [...] is especially recommended for storing monetary amounts
> and other quantities where **exactness** is required. Calculations with numeric
> values yield exact results where possible, e.g., addition, subtraction,
> multiplication. However, calculations on numeric values **are very slow** compared
> to the integer types, or to the floating-point types described in the next
> section.

#### Partitioning

TODO. Maybe weekly.

## Implementation plan

We will start with implementing the timeseries service to provide a starting
point for adding the time series relations in the FIS module.

Examples of resources that *might* exist at some point and *might* have
references to `timeseries` are. This is just to show how we can use the
timeseries in our other resources.

* `baseline`
    * `timeseries_id` - the time series for the baseline
    * `for_timeseries_id` - the time series the baseline is for
* `channel` - of a `meter`
    * `timeseries_id` - the time series for the channel
* `price` - e.g spot price
    * `timeseries_id` - the time series for the price

## Integration

The integration with the rest of the system will happen as shown below. This is
a conceptual drawing of the integration. The main point is that the time series
service will not reference the main FIS module, only the other way around. This
is to ensure that the time series service can be decoupled and used
independently of the main FIS module.

This will also allow us to change the implementation of the time series service
when we learn some more.

![Time series integration with other modules](../diagrams/time_series_integration.drawio.png)

Future external interfaces might include

* bulk endpoints for large datasets - with asynchronous processing
* mqtt or simliar interfaces for real-time updates

## Alternatives

TODO

## Estimates

TODO
