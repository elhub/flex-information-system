# Product type

A type of product to be bought by system operators on a flexibility market.

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

| Type                                              | Category                  | Market      | Market type  |  Example              | Notes                                                                                                 |
|---------------------------------------------------|---------------------------|-------------|--------------|-----------------------|-------------------------------------------------------------------------------------------------------|
| `manual_congestion_activation` [^1]               | `congestion`              | `local`     | `activation` | ShortFlex             | Activation.                                                                                           |
| `manual_congestion_capacity` [^1]                 | `congestion`              | `local`     | `capacity`   | LongFlex              | Capacity.                                                                                             |
| `automatic_congestion_capacity`                   | `congestion`              | `local`     | `capped`     | MaxUsage              | Capacity restriction for a period.                                                                    |
| `automatic_voltage_capacity`                      | `voltage`                 | `local`     | `capacity`   |                       | Automatic reserves for voltage control.                                                               |
| `manual_voltage_capacity`                         | `voltage`                 | `local`     | `capacity`   |                       | Manual reserves for voltage control.                                                                  |
| `automatic_fast_frequency_capacity`               | `balancing`               | `balancing` | `capacity`   | FRR Profil, FRR Flex  |                                                                                                       |
| `automatic_frequency_containment_capacity`        | `balancing`               | `balancing` | `capacity`   | FCR-N, FCR-D          | For normal operation 49,9-50,1Hz. For disturbances outside normal.                                    |
| `automatic_frequency_restoration_activation` [^1] | `balancing`               | `balancing` | `activation` | aFRR                  | There is currently no activation market for aFRR.                                                     |
| `automatic_frequency_restoration_capacity` [^1]   | `balancing`               | `balancing` | `capacity`   | aFRR CM               | Capacity.                                                                                             |
| `manual_frequency_restoration_activation` [^1]    | `balancing`, `congestion` | `balancing` | `activation` | mFRR EAM, mFRR-D, EAM | Activation, activation for larger disruptions, congestion due to "spesialreguleringer" from Statnett. |
| `manual_frequency_restoration_capacity` [^1]      | `balancing`, `congestion` | `balancing` | `capacity`   | mFRR CM, mFRR-D CM    | Capacity, capacity for larger disruptions, congestion due to "spesialreguleringer" from Statnett.     |

[^1]: The reason for having two product types for congestion, aFRR and mFRR is
      that it might be easier to qualify for an activation product than a
      capacity product.

## Relevant links

* [API Documentation](/api/v0/#/operations/list_product_type)
* [Download docx](/docs/download/product_type.docx)

## Fields

| Name                                                                  | Description                                           | Format                                    | Reference |
|-----------------------------------------------------------------------|-------------------------------------------------------|-------------------------------------------|-----------|
| <a name="field-id" href="#field-id">id</a>                            | Unique surrogate identifier.                          | bigint<br/>Read only                      |           |
| <a name="field-business_id" href="#field-business_id">business_id</a> | The code for this product type.                       | text<br/>Max length: `64`<br/>Read only   |           |
| <a name="field-category" href="#field-category">category</a>          | The category of the product type.                     | text<br/>Max length: `64`<br/>Read only   |           |
| <a name="field-market" href="#field-market">market</a>                | The market which the product type belongs to.         | text<br/>Max length: `64`<br/>Read only   |           |
| <a name="field-market_type" href="#field-market_type">market_type</a> | The type of market which the product type belongs to. | text<br/>Max length: `64`<br/>Read only   |           |
| <a name="field-examples" href="#field-examples">examples</a>          | Examples of products belonging to this product type.  | text<br/>Max length: `128`<br/>Read only  |           |
| <a name="field-notes" href="#field-notes">notes</a>                   | Additional information about a product type.          | text<br/>Max length: `1024`<br/>Read only |           |

## Validation Rules

### Inter-Field Validation

No validation rules.

### Resource-Level Validation

No validation rules

### Process-Level Validation

No validation rules.

## Notifications

No notifications.

## Authorization

### Resource Level Authorization

Below is the [RLA](../auth.md#resource-level-authorization-rla) for the
resource. The default policy is **deny**.

#### Anonymous

No policies.

#### Entity

No policies.

#### Common

No policies.

#### Balance Responsible Party

No policies.

#### End User

No policies.

#### Energy Supplier

No policies.

#### Flexibility Information System Operator

No policies.

#### Market Operator

No policies.

#### System Operator

No policies.

#### Service Provider

No policies.

#### Third Party

No policies.

### Field Level Authorization

For party type abbreviations, check [the auth docs](../auth.md#party)

| FIELD       | ANON | BRP | ES | EU | FISO | MO | SO | SP | TP |
|-------------|------|-----|----|----|------|----|----|----|----|
| id          |      | R   | R  | R  | R    | R  | R  | R  | R  |
| business_id |      | R   | R  | R  | R    | R  | R  | R  | R  |
| category    |      | R   | R  | R  | R    | R  | R  | R  | R  |
| market      |      | R   | R  | R  | R    | R  | R  | R  | R  |
| market_type |      | R   | R  | R  | R    | R  | R  | R  | R  |
| examples    |      | R   | R  | R  | R    | R  | R  | R  | R  |
| notes       |      | R   | R  | R  | R    | R  | R  | R  | R  |
