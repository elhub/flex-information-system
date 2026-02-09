# CU Lookup

This process is used to look up information about controllable units to verify
whether they are already registered in the system before initiating the following
processes:

- [controllable unit registration](controllable-unit-registration.md)
- [service provider switching](service-provider-switching.md)

## Why is CU lookup a necessary process?

1. To verify whether the unit is already registered in the system to determine next
step

    This process retrieves the necessary information from FIS, to ensure that the
    service provider has sufficient data to determine the appropriate process
    to execute.

    After a successful request, the service provider evaluates the returned CU
    data and decides the next step. If the CU is there, then
    the next step could be [service provider switching](service-provider-switching.md)
    or evaluation of the data. If the CU is not there, the service provider can
    create a new CU. This is further explained below.

2. To verify the link between the end user and the accounting point / CU

    Before starting the CU registration or switching process, the service provider
    needs to verify the link between the end user and the accounting point / CU.

3. To prevent unauthorized use

    To prevent unauthorized use, FIS requires the end user id from the service
    provider to allow them to access CU data.

    If the accounting point or CU is
    already part of the system, this validation will be done based on existing data
    in FIS. Data for accounting points with CUs will always be synced from Elhub.

    If, however, the service provider is requesting data for an accounting point
    that does not have any CUs registered in FIS, there will be a synchronous lookup
    towards Elhub to validate the accounting point end user relation. From then
    on, the accounting point will be part of the regular data sync from Elhub.

## Prerequisites

- Service provider has a consent from the end user to request data on the
  accounting point / CU.
- Service provider knows the end user id and other key information about
  accounting point / CU.
- CU ID provided from FIS must be used in service provider switching.

## Request and response

The input to the controllable unit lookup contains three fields:

- end user (EU) business identifier
- accounting point (AP) business identifier
- controllable unit (CU) business identifier

The request must contain EU and one of AP or CU. If that requirement is not met,
or the format of the input is malformed, the request will be rejected with a
`400 - Bad Request` response.

If the request is valid, but the requested resource (CU or AP) does not exist,
the response will be `404 - Not Found`. If the requested resource exist, but the
end user does not match the end user associated with the CU or AP, the response
will be `403 - Forbidden`.

Upon a successful request, the response will be `200 - Ok` and contain the
following fields:

| Field              | Abbr | Description                                                                            |
|--------------------|------|----------------------------------------------------------------------------------------|
| end_user           | EU   | Technical identifier for the end user.                                                 |
| accounting_point   | AP   | Information about the accounting point, including its identifier.                      |
| controllable_units | CU   | A list of controllable units, if found. Each containing a list of technical resources. |

The following table describes the possible combinations of input parameters and
the expected response. The column `Next action` is just ment as a guide.

| CU  | AP  | AP exists | CU(s) exists | EU matches | HTTP response   | Response      | Next action           |
|-----|-----|-----------|--------------|------------|-----------------|---------------|-----------------------|
| Yes | No  | ❔        | ❌           | ❔         | 404 - Not found | ErrorMessage  | Check request data    |
| Yes | No  | ❔        | ✅           | ❌         | 403 - Forbidden | ErrorMessage  | Check request data    |
| Yes | No  | ❔        | ✅           | ✅         | 200 - Ok        | EU, AP, CU(1) | Create contract       |
| No  | Yes | ❌        | ❔           | ❔         | 404 - Not found | ErrorMessage  | Check request data    |
| No  | Yes | ✅        | ❔           | ❌         | 403 - Forbidden | ErrorMessage  | Check request data    |
| No  | Yes | ✅        | ❌           | ✅         | 200 - Ok        | EU, AP, CU(0) | Create CU             |
| No  | Yes | ✅        | ✅           | ✅         | 200 - Ok        | EU, AP, CU(n) | Evaluate returned CUs |

## Sequence

[Full Size](../diagrams/controllable_unit_lookup.png) | [PlantUML description](../diagrams/controllable_unit_lookup.plantuml)

![Controllable Unit Lookup](../diagrams/controllable_unit_lookup.png)
