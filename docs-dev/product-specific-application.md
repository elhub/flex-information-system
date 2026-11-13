# Product-specific application details

<!-- markdownlint-disable MD013 -->

> **Status:** Phase 1 is implemented in the backend (API, database, generated
> models, test client, docs). The frontend is not updated yet.
>
> Deviations from the original proposal:
>
> * Up and down are separate fields for **all** variants (`maximum_active_power_up`
>   and `maximum_active_power_down`, and `approved_*` in the assessment). For
>   **FCR-N** the two values must be equal, for FCR-D they are independent.
>   There is no `maximum_active_power` field.
> * `POST` and `PATCH` of the resource are served by a **Kotlin endpoint**
>   (option 2), mounted before PostgREST for those two routes. Reads, lists and
>   history stay on PostgREST. The endpoint validates the details against the
>   typed Fabrikt variants and extra rules (ranges, lengths, FCR-N equality),
>   then writes through the `api` view with the role of the caller, so RLS,
>   field-level grants and the other triggers still apply.
> * All validation of the details (VAL012 and VAL013) is done by the endpoint,
>   and there is no trigger or lookup table for it in the database. The variants
>   of each product type are derived from the generated models
>   (`ProductVariants`). There is no generic JSON validator in SQL.
> * The **sync of the deprecated mFRR columns** is done by the endpoint, not by
>   triggers. Writing the old columns for mFRR updates `application_details`, and
>   the other way around. Direct SQL does not sync them.
> * The `oneOf` lists and mappings in `openapi-api-base.yml` are written by hand.
> * Existing rows are only validated again when `product_type_ids`,
>   `application_details`, assessment details or the deprecated columns are in
>   the request.
> * Product types without a variant (including mFRR-D) have no details, and the
>   deprecated columns are not accepted for them.

## TL;DR

* An **application** is for **exactly one product type**. It consists of
  general fields plus the **product-specific details** for that product type.
* The details are stored in **two new JSONB columns** on _Service Providing
  Group Product Application_ (SPGPA):
    * `application_details`: what the **applicant (SP)** asks for
    * `assessment_details`: the **procuring system operator's (PSO)** response
* Both are **polymorphic objects** with a `kind` discriminator. `kind` is the
  product type `business_id`, and selects the **variant** that applies.
* Variants are **typed**, defined in the OpenAPI spec and released with the
  API. The first variants are **mFRR** (existing fields moved in), **FCR-N**
  and **FCR-D** (new).
* Models for the **frontend (TS + zod)**, **Kotlin (Fabrikt)** and the
  **Python test client** are generated from the spec. **Database validation**
  is generated from the same definitions.
* The five current mFRR columns are **deprecated**, kept in sync for a
  transition period, and then removed. After that, the application has no
  product-specific columns.

## Terminology

| Term | Meaning |
| --- | --- |
| Application details | Product-specific input from the applicant (SP). |
| Assessment details | Product-specific response from the PSO, for example approved values. |
| Variant | The schema of the details for one product type, for example `spgpa_application_details_fcr_n`. |
| `kind` | Discriminator inside the details. Its value is the product type `business_id`. |

## Background

Today SPGPA has product-specific fields as flat columns:

| Column                      | Applies to     | Rule today                 |
|-----------------------------|----------------|----------------------------|
| `maximum_active_power_up`   | all (NOT NULL) | required                   |
| `maximum_active_power_down` | all (NOT NULL) | required                   |
| `ramping_capability`        | mFRR           | required for mFRR (VAL007) |
| `ramping_description`       | mFRR           | required for mFRR (VAL008) |
| `additional_information`    | all            | optional                   |

In practice all of these are mFRR inputs, because mFRR is the only product
type in use. FCR needs other inputs, and part of them are set by the PSO and
not the applicant. Adding more flat columns for every product type does not
scale, and the API response would get more and more `null` fields that do not
apply.

## Alternatives considered

|                        | A: Flat columns      | B: Runtime-dynamic schema | **B3: Typed variants (proposed)** |
|------------------------|----------------------|---------------------------|-----------------------------------|
| Storage                | one column per field | JSONB                     | JSONB                             |
| Schema defined in      | `resources.yml`      | data (`product_type`)     | OpenAPI components                |
| New product variant    | migration + code     | data change only          | spec change + release             |
| Generated typed models | yes                  | no                        | **yes**                           |
| Response shape         | many `null`s         | generic object            | **only the relevant variant**     |
| Effort                 | low                  | high                      | medium                            |

We don't need to change variants at runtime, so B3 gives the benefits of B
while keeping typed models and documentation.

### Decisions already made

* **One product type per application.** This makes a single object per column
  possible and keeps names free of product type prefixes.
* **Discriminator (`kind`)** instead of an object keyed by product type. This
  follows the same pattern as `notice.data` and `event.data`.
* **No product prefixes** on properties: `maximum_active_power`, not
  `fcr_n_maximum_active_power`. `kind` already tells which product it is.
* **FCR-N and FCR-D are separate product types.**

## Product types

| Product | `business_id` (= `kind`) | Change |
| --- | --- | --- |
| mFRR | `manual_frequency_restoration` | none |
| FCR-N | `automatic_frequency_containment` | existing row, name and products changed to FCR-N only |
| FCR-D | `automatic_frequency_containment_disturbance` | new row |

Reusing the existing `business_id` for FCR-N follows the existing mFRR /
mFRR-D naming (`manual_frequency_restoration` and
`manual_frequency_restoration_disruption`), and keeps ids stable. Changes go
in `db/flex/reference_data/product_type.csv`.

## Data model

```text
                       ┌──────────────────────────────┐
                       │ product_type                 │
                       │  id, business_id, name, ...  │
                       └──────────────▲───────────────┘
                                      │ product_type_ids (exactly one)
┌─────────────────────────────────────┴───────────────────────────────┐
│ service_providing_group_product_application                         │
│                                                                     │
│  id, service_providing_group_id, procuring_system_operator_id,      │
│  product_type_ids, status, prequalified_at, verified_at,            │
│  created_at, complete_at                                            │
│                                                                     │
│  application_details  jsonb  ◄── NEW, written by the SP             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ { "kind": "<product type business_id>", ...variant fields }   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  assessment_details   jsonb  ◄── NEW, written by the PSO            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ { "kind": "<same as application_details>", ...fields }        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  maximum_active_power_up/down, ramping_capability,                  │
│  ramping_description, additional_information   ◄── DEPRECATED       │
└─────────────────────────────────────────────────────────────────────┘
```

**Rules:**

* `application_details` is required if the product type has an application
  variant, and `null` otherwise. Its `kind` equals the product type
  `business_id`.
* `assessment_details` is `null` until the PSO responds, and always `null` for
  product types without an assessment variant. Its `kind` equals the `kind` of
  `application_details`.

## Variants

### Connection between product type and variants

| `kind` (product type)                         | Application variant               | Assessment variant               |
|-----------------------------------------------|-----------------------------------|----------------------------------|
| `manual_frequency_restoration`                | `spgpa_application_details_mfrr`  | none                             |
| `automatic_frequency_containment`             | `spgpa_application_details_fcr_n` | `spgpa_assessment_details_fcr_n` |
| `automatic_frequency_containment_disturbance` | `spgpa_application_details_fcr_d` | `spgpa_assessment_details_fcr_d` |

This connection is defined by the `oneOf` list and the discriminator mapping
of `spgpa_application_details` and `spgpa_assessment_details` in
`openapi-api-base.yml`. The endpoint reads it from the generated models.

### Fields per variant

**Application details** (written by the SP). All fields are required, except
`additional_information`.

| Property                               | Type                      | mFRR | FCR-N | FCR-D |
|----------------------------------------|---------------------------|------|-------|-------|
| `kind`                                 | text (discriminator)      | ✅   | ✅    | ✅    |
| `maximum_active_power_up`              | decimal (kW)              | ✅   | ✅    | ✅    |
| `maximum_active_power_down`            | decimal (kW)              | ✅   | ✅    | ✅    |
| `ramping_capability`                   | enum always/partial/never | ✅   |       |       |
| `ramping_description`                  | text                      | ✅   |       |       |
| `additional_information`               | text (max 512), optional  | ✅   |       |       |
| `service_provider_contact_information` | text                      |      | ✅    | ✅    |
| `technical_contact_information`        | text                      |      | ✅    | ✅    |
| `limited_energy_reservoir`             | boolean                   |      | ✅    | ✅    |
| `variable_production_consumption`      | boolean                   |      | ✅    | ✅    |
| `planned_prequalification_test_date`   | date                      |      | ✅    | ✅    |

**Assessment details** (written by the PSO). All fields are required once the
PSO responds.

| Property                             | Type                 | mFRR | FCR-N | FCR-D |
|--------------------------------------|----------------------|------|-------|-------|
| `kind`                               | text (discriminator) |      | ✅    | ✅    |
| `approved_maximum_active_power_up`   | decimal (kW)         |      | ✅    | ✅    |
| `approved_maximum_active_power_down` | decimal (kW)         |      | ✅    | ✅    |

Notes:

* For FCR-N, `maximum_active_power_up` and `maximum_active_power_down` must be
  equal, and so must `approved_maximum_active_power_up` and
  `approved_maximum_active_power_down`. For FCR-D they are independent.
* The organisation, party and name of the SP already exist in FIS
  (application → SPG → `service_provider_id` → `party`). The FCR sections show
  them read-only in the UI instead of storing them again. Only the contact
  person is entered, in `service_provider_contact_information`.
* FCR form B is uploaded as an attachment, which already works.
* The shared FCR fields are repeated in the FCR-N and FCR-D variants instead
  of using `allOf`, because inheritance combined with a discriminator is
  another thing the generators may handle poorly.

## Examples

The product type ids are illustrative.

### FCR-N

The SP creates the application:

```text
POST /service_providing_group_product_application
```

```json
{
  "service_providing_group_id": 18,
  "procuring_system_operator_id": 39,
  "product_type_ids": [6],
  "application_details": {
    "kind": "automatic_frequency_containment",
    "service_provider_contact_information": "Kari Nordmann, +47 ...",
    "technical_contact_information": "Ola Nordmann, +47 ...",
    "limited_energy_reservoir": true,
    "variable_production_consumption": false,
    "planned_prequalification_test_date": "2026-12-01",
    "maximum_active_power_up": 1000,
    "maximum_active_power_down": 1000
  }
}
```

The PSO responds:

```text
PATCH /service_providing_group_product_application/{id}
```

```json
{
  "assessment_details": {
    "kind": "automatic_frequency_containment",
    "approved_maximum_active_power_up": 900,
    "approved_maximum_active_power_down": 900
  }
}
```

### FCR-D

The SP creates the application:

```text
POST /service_providing_group_product_application
```

```json
{
  "service_providing_group_id": 18,
  "procuring_system_operator_id": 39,
  "product_type_ids": [10],
  "application_details": {
    "kind": "automatic_frequency_containment_disturbance",
    "service_provider_contact_information": "Kari Nordmann, +47 ...",
    "technical_contact_information": "Ola Nordmann, +47 ...",
    "limited_energy_reservoir": false,
    "variable_production_consumption": true,
    "planned_prequalification_test_date": "2026-12-01",
    "maximum_active_power_up": 800,
    "maximum_active_power_down": 600
  }
}
```

The PSO responds:

```text
PATCH /service_providing_group_product_application/{id}
```

```json
{
  "assessment_details": {
    "kind": "automatic_frequency_containment_disturbance",
    "approved_maximum_active_power_up": 700,
    "approved_maximum_active_power_down": 500
  }
}
```

### mFRR

mFRR has no assessment variant, so `assessment_details` stays `null`.

```json
{
  "service_providing_group_id": 18,
  "procuring_system_operator_id": 39,
  "product_type_ids": [8],
  "application_details": {
    "kind": "manual_frequency_restoration",
    "maximum_active_power_up": 150.5,
    "maximum_active_power_down": 150.5,
    "ramping_capability": "partial",
    "ramping_description": "Units are connected one by one.",
    "additional_information": "Available on weekdays only."
  }
}
```

### Rejected request

An FCR-N response with the kind of FCR-D is rejected:

```json
{
  "assessment_details": {
    "kind": "automatic_frequency_containment_disturbance",
    "approved_maximum_active_power_up": 700,
    "approved_maximum_active_power_down": 500
  }
}
```

```text
PT400  assessment_details.kind must be automatic_frequency_containment
```

An FCR-N response where up and down differ is rejected too:

```text
PT400  assessment_details.approved_maximum_active_power_up and assessment_details.approved_maximum_active_power_down must be equal
```

### Updates replace the whole object

PostgREST replaces a JSONB column as a whole on `PATCH`. The SP sends the full
`application_details` when updating it, and the PSO sends the full
`assessment_details`. Since each role only writes its own column, they can't
overwrite each other's values.

## OpenAPI and generated code

The variants are named components in `openapi/openapi-api-base.yml`. The two
union components use `oneOf` with a `discriminator`, in the same way as
`notice_data`:

```yaml
spgpa_application_details:
  oneOf:
    - $ref: "#/components/schemas/spgpa_application_details_mfrr"
    - $ref: "#/components/schemas/spgpa_application_details_fcr_n"
    - $ref: "#/components/schemas/spgpa_application_details_fcr_d"
  discriminator:
    propertyName: kind
    mapping:
      manual_frequency_restoration: "#/components/schemas/spgpa_application_details_mfrr"
      automatic_frequency_containment: "#/components/schemas/spgpa_application_details_fcr_n"
      automatic_frequency_containment_disturbance: "#/components/schemas/spgpa_application_details_fcr_d"

spgpa_application_details_fcr_n:
  type: object
  additionalProperties: false
  required:
    - kind
    - service_provider_contact_information
    - technical_contact_information
    - limited_energy_reservoir
    - variable_production_consumption
    - planned_prequalification_test_date
    - maximum_active_power_up
    - maximum_active_power_down
  x-equal-fields: [maximum_active_power_up, maximum_active_power_down]
  properties:
    kind: { const: automatic_frequency_containment }
    limited_energy_reservoir: { type: boolean }
    planned_prequalification_test_date: { type: string, format: date }
    maximum_active_power_up: { $ref: "#/components/schemas/spgpa_maximum_active_power" }
    maximum_active_power_down: { $ref: "#/components/schemas/spgpa_maximum_active_power" }
    # ...

spgpa_assessment_details:
  oneOf:
    - $ref: "#/components/schemas/spgpa_assessment_details_fcr_n"
    - $ref: "#/components/schemas/spgpa_assessment_details_fcr_d"
  discriminator:
    propertyName: kind
    mapping: { ... }
```

In `resources.yml`, both columns are nullable references, like `notice.data`:

```yaml
application_details:
  type: object
  oneOf:
    - $ref: "#/components/schemas/spgpa_application_details"
    - type: "null"
```

The variant descriptions name their counterpart, for example "Answered by
`spgpa_assessment_details_fcr_n`", so the connection is visible in the API
docs too.

```text
           openapi/product-variants.yml   (kind → application / assessment variant)
           openapi-api-base.yml           (variant components)
           resources.yml                  (application_details, assessment_details)
                                   │
                             just openapi
       ┌───────────────┬───────────┴─────┬──────────────────┬──────────────────────┐
       ▼               ▼                 ▼                  ▼                      ▼
  openapi.json   frontend           kbackend             test/flex          db/flex/
  (API docs)     types.gen.ts       sealed interface     Python client      generated
                 zod.gen.ts         + data class per                        validation
                 (discriminated     variant
                  union on kind)
```

* **Frontend:** a union type and a `z.discriminatedUnion("kind", ...)` zod
  schema. The form selects one product type, sets `kind` from it, and shows
  the section component for that `kind`. The PSO can edit the assessment
  section, and the SP sees it read-only.
* **Kotlin:** a sealed interface `SpgpaApplicationDetails` with
  `@JsonClassDiscriminator("kind")` and one data class per variant, for
  example `SpgpaApplicationDetailsFcrN(maximumActivePower: BigDecimal, ...)`.
  It probably needs the same `sed` fix as `NoticeData` in
  `generate-openapi-models.sh`.
* **Translations and tooltips:** `resources_to_intl.py` is extended to cover
  the variant fields.

## Validation

Validation happens in layers. **The database is the source of truth**, in line
with our "thick database" principle. The frontend validation is only there for
a better user experience.

```text
  ┌──────────────┐   ┌──────────────────────────┐   ┌───────────────────────────────────┐
  │ Frontend     │   │ API (PostgREST)          │   │ Database (BEFORE INSERT/UPDATE)   │
  │              │   │                          │   │                                   │
  │ zod schema   │──►│ field-level grants       │──►│ 1. existing triggers (status,     │
  │ (discrimin-  │   │  (permissions.csv)       │   │    SP002, VAL001, ...)            │
  │  ated union) │   │ RLS (row access)         │   │ 2. legacy sync (transition only)  │
  │              │   │ JSON must be valid JSON  │   │ 3. VAL012 one product type        │
  │ (UX only)    │   │                          │   │ 4. VAL013 details (generated)     │
  └──────────────┘   └──────────────────────────┘   └───────────────────────────────────┘
```

### VAL012: exactly one product type

`product_type_ids` keeps its array type, to avoid another breaking change, but
new and updated applications must have exactly one element.

### VAL013: application and assessment details (generated)

1. **Application details:**
    * If the product type has an application variant, `application_details` is
      required, and its `kind` equals the product type `business_id`.
    * Otherwise, `application_details` must be `null`.
2. **Assessment details:**
    * `null`, or
    * the product type has an assessment variant, and its `kind` equals the
      `kind` of `application_details`.
3. **Each object against its variant:**
    * every `required` field is present and not null
    * no unknown fields (`additionalProperties: false`)
    * types are correct (`jsonb_typeof`, plus casts for `date` and `decimal`)
    * `minimum`, `maximum`, `maxLength` and `enum` are respected

Errors use our usual `PT400` format with the path to the field, for example:

```text
PT400  product_type_ids must contain exactly one product type
PT400  application_details.kind must be automatic_frequency_containment_disturbance
PT400  application_details.maximum_active_power_up is required
PT400  assessment_details is not allowed for kind manual_frequency_restoration
```

* VAL007 and VAL008 (mFRR ramping) are **replaced** by VAL013.
* The `NOT NULL` on `maximum_active_power_*` is removed.
* The 512-character limit on `additional_information` moves to `maxLength`
  in the mFRR variant.

Reasons to generate the checks in plain SQL (see the `pg_jsonschema`
alternative below):

* no new Postgres extension
* we only need a small subset of JSON Schema
* error messages can match our existing format

### Option: validating with `pg_jsonschema`

Instead of generating the checks in step 3 as plpgsql, we can use the
[`pg_jsonschema`](https://github.com/supabase/pg_jsonschema) extension. It is
a thin wrapper around the Rust `jsonschema` crate and adds functions such as:

```sql
jsonb_matches_schema(schema json, instance jsonb) → bool
jsonschema_validation_errors(schema json, instance json) → text[]
-- precompiled and cached per call site, about 4x faster:
jsonb_matches_compiled_schema(schema jsonschema, instance jsonb) → bool
jsonb_validation_errors_compiled(schema jsonschema, instance jsonb) → text[]
```

With the extension, we generate **plain JSON Schema** per variant from the
OpenAPI components instead of generating SQL checks:

```text
 openapi/product-variants.yml + openapi-api-base.yml
                                   │  just openapi
                                   ▼
            openapi_to_db.py: dereference $ref, remove OpenAPI-only keys
                                   │
                                   ▼
   db/flex/product_variant_schema.sql   (generated, Liquibase runOnChange)
     flex.product_variant_schema(kind text PK, application_schema json, assessment_schema json)
       'manual_frequency_restoration'                → { mFRR },  null
       'automatic_frequency_containment'             → { FCR-N }, { FCR-N }
       'automatic_frequency_containment_disturbance' → { FCR-D }, { FCR-D }
                                   │
                                   ▼
   VAL012 / VAL013 trigger on SPGPA
     1. exactly one product type, kind matches        (plain SQL)
     2. each object validated with jsonb_validation_errors_compiled
```

The rules that compare with `product_type_ids` can't be expressed in JSON
Schema alone, because they depend on data outside the JSON value. They stay a
short piece of SQL.

#### Sketch of the trigger

```sql
CREATE OR REPLACE FUNCTION flex.spgpa_validate_details()
RETURNS trigger SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
    product_kind      text;
    application_schema json;
    assessment_schema  json;
    errors            text[];
BEGIN
    IF cardinality(NEW.product_type_ids) <> 1 THEN
        RAISE sqlstate 'PT400' USING message = 'product_type_ids must contain exactly one product type';
    END IF;

    SELECT pt.business_id, pvs.application_schema, pvs.assessment_schema
      INTO product_kind, application_schema, assessment_schema
      FROM flex.product_type pt
      LEFT JOIN flex.product_variant_schema pvs ON pvs.kind = pt.business_id
     WHERE pt.id = NEW.product_type_ids[1];

    -- application_details
    IF application_schema IS NULL THEN
        IF NEW.application_details IS NOT NULL THEN
            RAISE sqlstate 'PT400' USING message = format(
                'application_details is not allowed for kind %s', product_kind);
        END IF;
    ELSE
        IF NEW.application_details IS NULL THEN
            RAISE sqlstate 'PT400' USING message = 'application_details is required';
        END IF;
        IF NEW.application_details ->> 'kind' IS DISTINCT FROM product_kind THEN
            RAISE sqlstate 'PT400' USING message = format(
                'application_details.kind must be %s', product_kind);
        END IF;
        errors := jsonb_validation_errors_compiled(
            application_schema::jsonschema, NEW.application_details);
        IF cardinality(errors) > 0 THEN
            RAISE sqlstate 'PT400' USING message = format(
                'application_details: %s', array_to_string(errors, '; '));
        END IF;
    END IF;

    -- assessment_details
    IF NEW.assessment_details IS NOT NULL THEN
        IF assessment_schema IS NULL THEN
            RAISE sqlstate 'PT400' USING message = format(
                'assessment_details is not allowed for kind %s', product_kind);
        END IF;
        IF NEW.assessment_details ->> 'kind' IS DISTINCT FROM product_kind THEN
            RAISE sqlstate 'PT400' USING message = format(
                'assessment_details.kind must be %s', product_kind);
        END IF;
        errors := jsonb_validation_errors_compiled(
            assessment_schema::jsonschema, NEW.assessment_details);
        IF cardinality(errors) > 0 THEN
            RAISE sqlstate 'PT400' USING message = format(
                'assessment_details: %s', array_to_string(errors, '; '));
        END IF;
    END IF;

    RETURN NEW;
END;
$$;
```

#### Example of a generated schema (FCR-D application, shortened)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["kind", "service_provider_contact_information", "maximum_active_power_up", "..."],
  "properties": {
    "kind": { "const": "automatic_frequency_containment_disturbance" },
    "limited_energy_reservoir": { "type": "boolean" },
    "planned_prequalification_test_date": {
      "type": "string",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
    },
    "maximum_active_power_up": {
      "type": "number", "minimum": 0, "maximum": 999999.999, "multipleOf": 0.001
    }
  }
}
```

#### Error messages

All errors in an object are returned at once:

```text
PT400  application_details: "maximum_active_power_up" is a required property; 1 is not of type "string"
```

The messages come from the crate. They are in English and don't include the
path to the field, but since the variants are flat, the field name is usually
enough.

#### Things to watch out for

1. **`format` is not checked.** In JSON Schema 2020-12, `format` is only an
   annotation by default.
    * `format: date` is ignored, so the generator must add a `pattern`, and we
      should still try a SQL `::date` cast. Otherwise `2026-02-31` gets
      through.
    * `format: decimal` is our own format and is ignored.
2. **`multipleOf: 0.001` with floating-point numbers.** The crate has special
   handling for decimal fractions, but values like `150.5` and `0.1` must be
   tested in the spike.
3. **The OpenAPI output isn't pure JSON Schema.** The generator has to:
    * inline `$ref`s (such as the shared `ramping_capability` enum)
    * remove `example`, `description`, `discriminator` and `x-*`
    * check how `nullable` and `oneOf` with `null` are written in our OAS 3.1
      output
4. **Rules that depend on other fields**, for example "ramping description
   required only when ramping isn't always", need `if/then` in the component,
   or have to stay in SQL. Today's mFRR rules are simple enough that this
   isn't an issue yet.
5. **Installing the extension.** It is built with Rust/pgrx and published as
   `.deb` files on GitHub releases.
    * `local/postgres/Dockerfile` installs it, and `local/postgres/init.sql`
      runs `CREATE EXTENSION IF NOT EXISTS pg_jsonschema;`, alongside PostGIS
      and pg_cron.
    * CI and the other environments need the same, and the extension has to
      be upgraded together with Postgres.

#### Generated plpgsql vs `pg_jsonschema`

| | Generated plpgsql | `pg_jsonschema` |
| --- | --- | --- |
| Install and operate | ✅ nothing new | ⚠️ new extension in every environment, plus its upgrades |
| Amount of generator code | ⚠️ larger: write SQL for each keyword | ✅ small: convert the spec to JSON Schema |
| JSON Schema coverage | ⚠️ only the subset we implement | ✅ everything (`if/then`, `oneOf`, `pattern`, ...) |
| `format` (date, decimal) | ✅ checked with a cast | ❌ not checked, needs `pattern` or SQL |
| Error messages | ✅ our format, path to the field, one at a time | ⚠️ all at once, English only, no path |
| Same rules as the spec | ⚠️ our own interpretation of the rules | ✅ almost the same schema as in OpenAPI |
| Performance | ✅ more than enough for our volume | ✅ Rust, precompiled schema |

Since we validate against nearly the same schema the API documents, with less
generator code, `pg_jsonschema` is an attractive choice. The API contract and
the generated models are the same with both options, so we can switch later.

### Who can write

Each column is authorized separately in `permissions.csv`:

| Party | `application_details` | `assessment_details` |
|-------|-----------------------|----------------------|
| SP    | R C U                 | R                    |
| SO    | R                     | R U                  |
| FISO  | R U                   | R U                  |

* SP002 (an SP can only update while the status is `requested`) still applies
  to `application_details`.
* OpenAPI's `readOnly` is **not** used for `assessment_details`. It would hide
  the field from the update request for everyone, including the PSO. The
  generated field-level authorization table documents who can write it.

## Migration and deprecation of mFRR columns

The five columns that move into `application_details` (with
`kind: manual_frequency_restoration`) are:

* `maximum_active_power_up`
* `maximum_active_power_down`
* `ramping_capability`
* `ramping_description`
* `additional_information`

```text
  today                 Phase 1 (release N)                       Phase 2 (sunset, N+x)
──────────┼──────────────────────────────────────────────────┼──────────────────────────────
 flat     │ + application_details (backfilled from columns)  │ columns removed from API,
 columns  │ + assessment_details                             │ table and history
          │ legacy columns: deprecated, nullable,            │ sync trigger removed
          │   kept in sync both ways by a trigger            │ changelog: "Removed ..."
          │ frontend uses the new columns only               │ (maybe new Api-Version)
          │ changelog: "Added ... / Deprecated ..."          │
```

How the legacy sync works in Phase 1 for mFRR applications, before VAL013
runs:

```text
 legacy columns changed?  application_details changed?  result
 ───────────────────────  ────────────────────────────  ─────────────────────────────────
 yes                      no                            copy columns → application_details
 no                       yes                           copy application_details → columns
 yes                      yes (same values)             ok
 yes                      yes (different values)        PT400 conflict
 non-mFRR application with legacy columns set           PT400
```

The backfill only applies to mFRR applications, and it also updates the
**history table**, so nothing is lost when the columns are dropped in Phase 2.

Other product types are not in use today, so there should be no
applications without mFRR that have values in these columns. The migration
also counts and logs:

* applications without mFRR that have values in the legacy columns. Their
  values would only remain in history after Phase 2.
* applications with more than one product type. VAL012 only applies to new
  and updated rows, so these stay as they are until they are updated.

## Implementation option: PostgREST vs Kotlin endpoint

Where should create and update for SPGPA be handled?

```text
 Option 1: PostgREST (as today)

   client ──► Go proxy ──► PostgREST ──► api.spgpa view ──► flex.spgpa
                                                            └─ triggers incl. VAL012/VAL013

 Option 2: Kotlin endpoint (writes) + PostgREST (reads)

   POST/PATCH ──► Go proxy ──► Ktor route ──► FlexTransaction ──► flex.spgpa
                                (Fabrikt model, (SET LOCAL ROLE,   └─ triggers
                                 typed validation) RLS still applies)
   GET/list   ──► Go proxy ──► PostgREST ──► api.spgpa view
```

Option 2 follows the precedent of attachments, where writes go to Kotlin and
reads go to PostgREST.

| | **1. PostgREST + DB validation** | **2. Kotlin endpoint** |
| --- | --- | --- |
| Consistency with other resources | ✅ same as all other resources | ⚠️ new pattern for a core resource |
| Effort | ✅ lower: spec, generated SQL, triggers | ❌ higher: route, mapping, error handling, proxy routing in `backend/data/data.go` |
| Typed validation | ⚠️ generated plpgsql | ✅ Fabrikt models, Kotlin code |
| Error messages | ⚠️ `PT400` text | ✅ rich, structured (multiple errors at once) |
| Protects all write paths | ✅ in the database | ⚠️ only if the DB validation stays too, which means validating twice |
| Filtering, pagination, `select`, embedding | ✅ free from PostgREST | ⚠️ keep reads on PostgREST, or rebuild them |
| RLS and field-level grants | ✅ unchanged | ✅ still enforced via `SET LOCAL ROLE` |
| Version-aware responses (old/new shape per `Api-Version`) | ❌ needs the sync trigger | ✅ can map per version |
| Fits the Kotlin migration | ⚠️ another resource to move later | ✅ moves us forward |
| Unit testing | ⚠️ DB/API tests only | ✅ plus Kotlin unit tests |

**Suggestion:** start with **option 1**. Validation stays in the database
whichever option we pick, so option 2 can be added later as part of the
general move to Kotlin.

## Changes per area (Phase 1)

| Area | Change |
| --- | --- |
| `openapi/product-variants.yml` | new: `kind` → application / assessment variant |
| `openapi/openapi-api-base.yml` | union components with discriminator, variants for mFRR, FCR-N and FCR-D, shared `ramping_capability` enum |
| `openapi/resources.yml` | add `application_details` and `assessment_details`; deprecate 5 fields |
| `local/scripts/resources_to_openapi.py` | build the `oneOf` lists and mappings from `product-variants.yml` |
| `local/scripts/openapi_to_db.py` | generate the VAL013 validation |
| `db/flex/reference_data/product_type.csv` | FCR-N renamed, FCR-D added |
| `db/flex/..._migrations.sql` | new columns, drop NOT NULL, backfill (incl. history), sync trigger, VAL012, VAL013, drop VAL007/008 |
| `local/input/permissions.csv` | rows for `application_details` and `assessment_details` |
| `local/scripts/resources_to_intl.py` | labels and tooltips for variant fields |
| `kbackend/scripts/generate-openapi-models.sh` | possibly a `sed` fix for the sealed interfaces, as for `NoticeData` |
| `frontend/.../product_application/` | single product type, section per `kind`, assessment section for the PSO, show/print, draft migration |
| `kbackend` | regenerated models, test data |
| `test/api_client_tests/` | mFRR, FCR-N, FCR-D, PSO response, sync, rejection cases; fixtures with one product type |
| `docs/` | resource docs incl. variant table, product type docs, changelog |

## Open points for discussion

1. Sunset date for the deprecated mFRR columns. Should Phase 2 add a new
   `Api-Version`?
2. Column names: `application_details` and `assessment_details`, or other
   names?
3. When can the PSO write `assessment_details`: at any status, or only from
   `prequalification`? Must it be set before the status becomes
   `prequalified` for FCR-N and FCR-D?
4. Should `product_type_ids` later become a single `product_type_id`? That is
   a separate breaking change with its own deprecation.
5. PostgREST or a Kotlin endpoint, see above.
6. Generated SQL validator or the `pg_jsonschema` extension?
7. Filtering on details, for example
   `application_details->>limited_energy_reservoir`: do we need it, and does
   the Go proxy pass it through?

## Next step

A spike: add the variant components, the discriminator and the two columns,
and run `just openapi`. Check that:

* the discriminated union works in **request bodies** with all generators
  (TS/zod, Fabrikt, Python client). Our existing `oneOf` examples are
  read-only responses.
* Fabrikt produces a usable sealed interface, and whether it needs a `sed`
  fix.
* `deprecated: true` reaches the generated spec.

If the discriminator works poorly in request bodies, the fallback is an object
keyed by product type, with a single key.
