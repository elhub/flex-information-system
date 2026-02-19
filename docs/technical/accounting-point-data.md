# Accounting point data from datahub

FIS relies on accounting point data to

* do authorization
* check consistencies
* aid prequalification
* and more

This data is assumed to be mastered and maintained in an external system. In
Norway, this is in the national datahub, Elhub.

Accounting point data is fetched from the datahub and loaded into the FIS
database. We need to provision a local copy to be able to efficiently use the
data in the FIS. We only fetch data for accounting points that are relevant,
meaning those that have controllable units connected to them.

Fetching and updating data must happen...

* in [Controllable Unit Lookup](../processes/controllable-unit-lookup.md) for
  accounting points not already in the system.
* on a regular basis to keep data in sync.

It is the FIS that will reach out to the datahub for (updated) data.

## Adapter service

The [adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern) is a well-
known pattern when integrating data from external systems. In a data
synchronization use case like this, it is basically about wrapping/translating
the data/API.

The way we leverage the adapter pattern for fetching accounting point data is
that we expect that a separate adapter _service_ is available for the FIS to
call. The adapter service is responsible for the conversion of the external
API/data into a format that is expected in our bounded context.

The diagram below illustrates the relationship between the FIS, the adapter and
the datahub.

![Overview of FIS, adapter and datahub](../diagrams/accounting-point-adapter.drawio.png)

The reason for keeping this responsibility outside of the FIS is that
depending on what country/context the system is deployed in, the data may be
sourced from different places with widely different source formats/APIs.

### API Contract

The adapter service must implement the OpenAPI document defined in
[backend/accountingpoint](https://github.com/elhub/flex-information-system/tree/main/backend/accountingpoint/static/openapi.yml).

### Authorization

Since the adapter service is assumed to be specifically deployed for the FIS, a
shared API Bearer key is configured on both sides.
