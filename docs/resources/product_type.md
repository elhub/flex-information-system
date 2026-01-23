# Product Type

A type of product to be bought by system operators on a flexibility market.
This resource is a read-only enumeration.

## Context

The list of product types is defined by national terms and conditions with
reference to table of equivalences.

The following is a list of product types, with their corresponding product
categories and example/specific products. NODES/EuroFlex currently has three
congestion products: LongFlex, ShortFlex and MaxUsage.
[Statnett has a set of products](https://www.statnett.no/for-aktorer-i-kraftbransjen/systemansvaret/kraftmarkedet/reservemarkeder/kort-om-de-ulike-reservene/),
and we also used a nice overview from
[Energinet](https://energinet.dk/el/systemydelser/introduktion-til-systemydelser/oversigt-over-systemydelser/)
as input.

!!! note "The is list is not final nor exhaustive"

    The list of product types is defined for discussion and will probably be
    adjusted/extended.

| Business ID                               | Name                            | Service               | Products             |
|-------------------------------------------|---------------------------------|-----------------------|----------------------|
| `manual_congestion`                       | Manual Congestion               | congestion management | LongFlex, ShortFlex  |
| `automatic_congestion`                    | Automatic Congestion            | congestion management | MaxUsage             |
| `automatic_voltage`                       | Automatic Voltage               | voltage control       |                      |
| `manual_voltage`                          | Manual Voltage                  | voltage control       |                      |
| `automatic_fast_frequency`                | Fast Frequency                  | balancing             | FFR Profil, FFR Flex |
| `automatic_frequency_containment`         | Frequency Containment           | balancing             | FCR-N, FCR-D         |
| `automatic_frequency_restoration`         | Automatic Frequency Restoration | balancing             | aFRR CM              |
| `manual_frequency_restoration`            | Manual Frequency Restoration    | balancing             | mFRR EAM, mFRR CM    |
| `manual_frequency_restoration_disruption` | Frequency Disruption            | balancing             | mFRR-D               |

## Relevant links

* [API Documentation](../api/v0/index.html#/operations/list_product_type)
* [Download docx](../download/product_type.docx)

## Fields

| Name                                                                  | Description                                          | Format                                  | Reference |
|-----------------------------------------------------------------------|------------------------------------------------------|-----------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                         | bigint<br/>Read only                    |           |
| <a name="field-business_id" href="#field-business_id">business_id</a> | The code for this product type.                      | text<br/>Read only                      |           |
| <a name="field-name" href="#field-name">name</a>                      | The name of the product type.                        | text<br/>Max length: `64`<br/>Read only |           |
| <a name="field-service" href="#field-service">service</a>             | The service offered by the product type.             | text<br/>Read only                      |           |
| <a name="field-products" href="#field-products">products</a>          | Examples of products belonging to this product type. | text<br/>Read only                      |           |

## Validation Rules

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../technical/auth/authz-model.md#resource-level-authorization-rla)
for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

No policies.

#### Common

| Policy key | Policy                  | Status |
|------------|-------------------------|--------|
| PT-COM001  | Read all product types. | DONE   |

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

No policies.

#### Organisation

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check
[the authentication docs](../technical/auth/authn-model.md#party-market-actors).

| FIELD       | ANON | BRP | ES | EU | FISO | SO | SP | TP | ORG |
|-------------|------|-----|----|----|------|----|----|----|-----|
| id          |      | R   | R  | R  | R    | R  | R  | R  |     |
| business_id |      | R   | R  | R  | R    | R  | R  | R  |     |
| name        |      | R   | R  | R  | R    | R  | R  | R  |     |
| service     |      | R   | R  | R  | R    | R  | R  | R  |     |
| products    |      | R   | R  | R  | R    | R  | R  | R  |     |
