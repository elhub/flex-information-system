# Product-specific application details

!!! note "Status"

    Proposal for discussion. Nothing is implemented yet.

## TL;DR

* The **application form** consists of general fields plus one **product
  section** for each selected product type with product-specific
  requirements.
* Each product section is **typed**, defined in the OpenAPI spec and released
  with the API.
* The product sections are stored in **one new JSONB column**,
  `application_details`, on _Service Providing Group Product Application_
  (SPGPA). It is **keyed by product type `business_id`**.
* An application can have **one or more product types**. Every selected
  product type with product-specific requirements must have its section
  filled in.
* The first two product sections are **mFRR** (existing fields moved in) and
  **FCR** (new, "form A" of the FCR application).
* Models for the **frontend (TS + zod)**, **Kotlin (Fabrikt)** and the
  **Python test client** are generated from the spec. **Database validation**
  is generated from the same definitions.
* The five current mFRR columns are **deprecated**, kept in sync for a
  transition period, and then removed. After that, the application has no
  product-specific columns.

## Terminology

| Term                          | Meaning                                                           |
|-------------------------------|-------------------------------------------------------------------|
| Application form              | The whole application: general fields plus product sections.      |
| Product section               | The part of the application form that a product type contributes. |
| Product-specific requirements | A product type has a product section. Today: mFRR and FCR.        |

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
type in use. FCR needs eleven other inputs. Adding more flat columns for every
product type does not scale, and the API response would get more and more
`null` fields that do not apply.

## Alternatives considered

|                        | A: Flat columns      | B: Runtime-dynamic schema | **B3: Typed per-product details (proposed)** |
|------------------------|----------------------|---------------------------|----------------------------------------------|
| Storage                | one column per field | JSONB                     | JSONB                                        |
| Schema defined in      | `resources.yml`      | data (`product_type`)     | OpenAPI components                           |
| New product section    | migration + code     | data change only          | spec change + release                        |
| Generated typed models | yes                  | no                        | **yes**                                      |
| Response shape         | many `null`s         | generic object            | **only relevant sections**                   |
| Effort                 | low                  | high                      | medium                                       |

We don't need to change product sections at runtime, so B3 gives the
benefits of B while keeping typed models and documentation.

## Data model

```text
                       ┌──────────────────────────────┐
                       │ product_type                 │
                       │  id, business_id, name, ...  │
                       └──────────────▲───────────────┘
                                      │ product_type_ids (1..n)
┌─────────────────────────────────────┴───────────────────────────────┐
│ service_providing_group_product_application                         │
│                                                                     │
│  id, service_providing_group_id, procuring_system_operator_id,      │
│  product_type_ids, status, prequalified_at, verified_at,            │
│  created_at, complete_at                                            │
│                                                                     │
│  application_details  jsonb  ◄── NEW                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ {                                                             │  │
│  │   "manual_frequency_restoration":    { ...mFRR section... },  │  │
│  │   "automatic_frequency_containment": { ...FCR section...  }   │  │
│  │ }                                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  maximum_active_power_up/down, ramping_capability,                  │
│  ramping_description, additional_information   ◄── DEPRECATED       │
└─────────────────────────────────────────────────────────────────────┘
```

**Rule:** the keys in `application_details` must be exactly the selected
product types with product-specific requirements.

| `product_type_ids`                   | Required `application_details` keys |
|--------------------------------------|-------------------------------------|
| `[mFRR]`                             | `manual_frequency_restoration`      |
| `[FCR]`                              | `automatic_frequency_containment`   |
| `[mFRR, FCR]`                        | both                                |
| `[FCR, <type without requirements>]` | `automatic_frequency_containment`   |
| `[<type without requirements>]`      | none, `{}`                          |

### Product sections

**mFRR** (`manual_frequency_restoration`): existing fields moved in, same
rules as today.

| Field                       | Type                      | Required |
|-----------------------------|---------------------------|----------|
| `maximum_active_power_up`   | decimal (kW)              | yes      |
| `maximum_active_power_down` | decimal (kW)              | yes      |
| `ramping_capability`        | enum always/partial/never | yes      |
| `ramping_description`       | text                      | yes      |
| `additional_information`    | text (max 512)            | no       |

**FCR** (`automatic_frequency_containment`): form A of the FCR application.
Form B is uploaded as an attachment, which already works.

| Field                                      | Type         | Required |
|--------------------------------------------|--------------|----------|
| `service_provider_contact_information`     | text         | yes      |
| `technical_contact_information`            | text         | yes      |
| `limited_energy_reservoir`                 | boolean      | yes      |
| `variable_production_consumption`          | boolean      | yes      |
| `planned_prequalification_test_date`       | date         | yes      |
| `fcr_n_maximum_active_power`               | decimal (kW) | yes      |
| `fcr_d_maximum_active_power_up`            | decimal (kW) | yes      |
| `fcr_d_maximum_active_power_down`          | decimal (kW) | yes      |
| `fcr_n_approved_maximum_active_power`      | decimal (kW) | yes      |
| `fcr_d_approved_maximum_active_power_up`   | decimal (kW) | yes      |
| `fcr_d_approved_maximum_active_power_down` | decimal (kW) | yes      |

All fields are provided by the applicant (SP).

The organisation, party and name of the SP already exist in FIS
(application → SPG → `service_provider_id` → `party`). The FCR section shows
them read-only in the UI instead of storing them again. Only the contact
person is entered, in `service_provider_contact_information`.

### Example request

`POST /service_providing_group_product_application` with both mFRR and FCR.
The product type ids are illustrative.

```json
{
  "service_providing_group_id": 18,
  "procuring_system_operator_id": 39,
  "product_type_ids": [
    6,
    8
  ],
  "application_details": {
    "manual_frequency_restoration": {
      "maximum_active_power_up": 150.5,
      "maximum_active_power_down": 150.5,
      "ramping_capability": "partial",
      "ramping_description": "Units are connected one by one.",
      "additional_information": "Available on weekdays only."
    },
    "automatic_frequency_containment": {
      "service_provider_contact_information": "Kari Nordmann, +47 ...",
      "technical_contact_information": "Ola Nordmann, +47 ...",
      "limited_energy_reservoir": true,
      "variable_production_consumption": false,
      "planned_prequalification_test_date": "2026-12-01",
      "fcr_n_maximum_active_power": 1000,
      "fcr_d_maximum_active_power_up": 800,
      "fcr_d_maximum_active_power_down": 800,
      "fcr_n_approved_maximum_active_power": 1000,
      "fcr_d_approved_maximum_active_power_up": 800,
      "fcr_d_approved_maximum_active_power_down": 800
    }
  }
}
```

## OpenAPI and generated code

The product sections are named components in `openapi/openapi-api-base.yml`,
and `resources.yml` refers to them in the same way `notice.data` does today.

```yaml
spgpa_application_details:
  type: object
  additionalProperties: false
  properties:
    manual_frequency_restoration:
      $ref: "#/components/schemas/spgpa_application_details_mfrr"
    automatic_frequency_containment:
      $ref: "#/components/schemas/spgpa_application_details_fcr"

spgpa_application_details_fcr:
  type: object
  additionalProperties: false
  required:
    - service_provider_contact_information
    - technical_contact_information
    - limited_energy_reservoir
    # ...
  properties:
    limited_energy_reservoir: { type: boolean }
    planned_prequalification_test_date: { type: string, format: date }
    fcr_n_maximum_active_power:
      { type: number, format: decimal, minimum: 0, maximum: 999999.999, multipleOf: 0.001 }
    # ...
```

The **property keys of `spgpa_application_details` are the mapping** from
product type to product section, so no extra lookup table is needed.

```text
                 openapi-api-base.yml  (spgpa_application_details_*)
                 resources.yml         (application_details: $ref ...)
                                │
                          just openapi
       ┌───────────────┬────────┴──────┬──────────────────┬───────────────────────┐
       ▼               ▼               ▼                  ▼                       ▼
  openapi.json   frontend           kbackend           test/flex          db/flex/
  (API docs)     types.gen.ts       Fabrikt models     Python client      spgpa_application_
                 zod.gen.ts         SpgpaApplication-                     details_validation.sql
                                    DetailsFcr(...)                       (generated)
```

* **Frontend:** `SpgpaApplicationDetailsFcr` type plus a
  `zSpgpaApplicationDetailsFcr` zod schema per product section.
* **Kotlin:** `data class SpgpaApplicationDetailsFcr(limitedEnergyReservoir:
  Boolean, fcrNMaximumActivePower: BigDecimal, plannedPrequalificationTestDate:
  LocalDate, ...)`.
* **Translations and tooltips:** `resources_to_intl.py` is extended to cover
  nested fields.

## Validation

Validation happens in layers. **The database is the source of truth**, in line
with our "thick database" principle. The frontend validation is only there for
a better user experience.

```text
  ┌──────────────┐   ┌──────────────────────────┐   ┌───────────────────────────────────┐
  │ Frontend     │   │ API (PostgREST)          │   │ Database (BEFORE INSERT/UPDATE)   │
  │              │   │                          │   │                                   │
  │ zod schema   │──►│ field-level grants       │──►│ 1. existing triggers (status,     │
  │ per selected │   │  (permissions.csv)       │   │    SP002, VAL001, ...)            │
  │ product type │   │ RLS (row access)         │   │ 2. legacy sync (transition only)  │
  │              │   │ JSON must be valid JSON  │   │ 3. VAL012 application_details     │
  │ (UX only)    │   │                          │   │    (generated from the spec)      │
  └──────────────┘   └──────────────────────────┘   └───────────────────────────────────┘
```

### VAL012: application details (generated)

A generated function,
`spgpa_validate_application_details(product_type_ids, application_details)`,
checks the following in this order:

1. `application_details` is a JSON object.
2. **Keys match the product types:** each selected product type with
   product-specific requirements has a key, and no other keys are present.
3. **Per section:**
    * every `required` field is present and not null
    * no unknown fields (`additionalProperties: false`)
    * types are correct (`jsonb_typeof`, plus casts for `date` and `decimal`)
    * `minimum`, `maximum`, `maxLength` and `enum` are respected

Errors use our usual `PT400` format with the path to the field, for example:

```text
PT400  application_details.automatic_frequency_containment.fcr_n_maximum_active_power is required
PT400  application_details.manual_frequency_restoration is not allowed: product type not selected
```

* VAL007 and VAL008 (mFRR ramping) are **replaced** by VAL012.
* The `NOT NULL` on `maximum_active_power_*` is removed.
* The 512-character limit on `additional_information` moves to `maxLength`
  in the mFRR section.

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

With the extension, we generate **plain JSON Schema** per product section from
the OpenAPI components instead of generating SQL checks:

```text
 openapi-api-base.yml
   spgpa_application_details_mfrr ─┐
   spgpa_application_details_fcr  ─┤  just openapi
                                   ▼
            openapi_to_db.py: dereference $ref, remove OpenAPI-only keys
                                   │
                                   ▼
   db/flex/product_section_schema.sql   (generated, Liquibase runOnChange)
     flex.product_section_schema(business_id text PK, schema json)
       'manual_frequency_restoration'     → { JSON Schema for the mFRR section }
       'automatic_frequency_containment'  → { JSON Schema for the FCR section }
                                   │
                                   ▼
   VAL012 trigger on SPGPA
     1. application_details is an object                  (plain SQL)
     2. keys = selected product types with a section      (plain SQL)
     3. each section validated with jsonb_validation_errors_compiled
```

Step 2 can't be expressed in JSON Schema alone, because it depends on
`product_type_ids`, which is outside the JSON value. It stays a short piece of
SQL.

#### Sketch of the trigger

```sql
CREATE OR REPLACE FUNCTION flex.spgpa_validate_application_details()
RETURNS trigger SECURITY DEFINER LANGUAGE plpgsql AS $$
DECLARE
    expected text[];
    actual   text[];
    section  text;
    errors   text[];
BEGIN
    IF jsonb_typeof(NEW.application_details) <> 'object' THEN
        RAISE sqlstate 'PT400' USING message = 'application_details must be an object';
    END IF;

    -- product types on the application that have a product section
    SELECT coalesce(array_agg(pt.business_id ORDER BY pt.business_id), '{}')
      INTO expected
      FROM flex.product_type pt
      JOIN flex.product_section_schema pss ON pss.business_id = pt.business_id
     WHERE pt.id = ANY (NEW.product_type_ids);

    SELECT coalesce(array_agg(k ORDER BY k), '{}')
      INTO actual
      FROM jsonb_object_keys(NEW.application_details) AS k;

    IF expected IS DISTINCT FROM actual THEN
        RAISE sqlstate 'PT400' USING message = format(
            'application_details must contain exactly the sections %s, got %s',
            expected, actual);
    END IF;

    FOREACH section IN ARRAY expected LOOP
        SELECT jsonb_validation_errors_compiled(
                   pss.schema::jsonschema, NEW.application_details -> section)
          INTO errors
          FROM flex.product_section_schema pss
         WHERE pss.business_id = section;

        IF cardinality(errors) > 0 THEN
            RAISE sqlstate 'PT400' USING message = format(
                'application_details.%s: %s', section, array_to_string(errors, '; '));
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$;
```

#### Example of a generated schema (FCR, shortened)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["service_provider_contact_information", "technical_contact_information", "..."],
  "properties": {
    "limited_energy_reservoir": { "type": "boolean" },
    "planned_prequalification_test_date": {
      "type": "string",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$"
    },
    "fcr_n_maximum_active_power": {
      "type": "number", "minimum": 0, "maximum": 999999.999, "multipleOf": 0.001
    }
  }
}
```

#### Error messages

All errors in a section are returned at once:

```text
PT400  application_details.automatic_frequency_containment:
       "fcr_n_maximum_active_power" is a required property; 1 is not of type "string"
```

The messages come from the crate. They are in English and don't include the
path to the field, but since the product sections are flat, the field name is
usually enough.

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
    * remove `example`, `description` and `x-*`
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

`application_details` is a single column, so authorization stays per column
in `permissions.csv`, with the same rights the current fields have:

| Party | Rights |
|-------|--------|
| SP    | R C U  |
| FISO  | R U    |
| SO    | R      |

SP002 (an SP can only update while the status is `requested`) still applies.

## Migration and deprecation of mFRR columns

The five columns that move into
`application_details.manual_frequency_restoration` are:

* `maximum_active_power_up`
* `maximum_active_power_down`
* `ramping_capability`
* `ramping_description`
* `additional_information`

```text
  today                 Phase 1 (release N)                       Phase 2 (sunset, N+x)
──────────┼──────────────────────────────────────────────────┼──────────────────────────────
 flat     │ + application_details (backfilled from columns)  │ columns removed from API,
 columns  │ legacy columns: deprecated, nullable,            │ table and history
          │   kept in sync both ways by a trigger            │ sync trigger removed
          │ frontend uses application_details only           │ changelog: "Removed ..."
          │ changelog: "Added ... / Deprecated ..."          │ (maybe new Api-Version)
```

How the legacy sync works in Phase 1, before VAL012 runs:

```text
 legacy columns changed?  details.mfrr changed?   result
 ───────────────────────  ─────────────────────   ─────────────────────────────────
 yes                      no                      copy columns → details.mfrr
 no                       yes                     copy details.mfrr → columns
 yes                      yes (same values)       ok
 yes                      yes (different values)  PT400 conflict
 non-mFRR application with legacy columns set     PT400
```

The backfill only applies to mFRR applications, and it also updates the
**history table**, so nothing is lost when the columns are dropped in Phase 2.

Other product types are not in use today, so there should be no
applications without mFRR that have values in these columns. The migration
counts and logs any such rows so we can check. Their values would only remain
in history after Phase 2.

## Implementation option: PostgREST vs Kotlin endpoint

Where should create and update for SPGPA be handled?

```text
 Option 1: PostgREST (as today)

   client ──► Go proxy ──► PostgREST ──► api.spgpa view ──► flex.spgpa
                                                            └─ triggers incl. VAL012

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

| Area                                 | Change                                                                                     |
|--------------------------------------|--------------------------------------------------------------------------------------------|
| `openapi/openapi-api-base.yml`       | `spgpa_application_details`, `_mfrr`, `_fcr`, shared `ramping_capability` enum             |
| `openapi/resources.yml`              | add `application_details`; deprecate 5 fields                                              |
| `local/scripts/openapi_to_db.py`     | generate `spgpa_validate_application_details`                                              |
| `db/flex/..._migrations.sql`         | new column, drop NOT NULL, backfill (incl. history), sync trigger, VAL012, drop VAL007/008 |
| `local/input/permissions.csv`        | `application_details` row                                                                  |
| `local/scripts/resources_to_intl.py` | nested field labels and tooltips                                                           |
| `frontend/.../product_application/`  | product section per selected product type, show/print sections, draft migration            |
| `kbackend`                           | regenerated models, test data                                                              |
| `test/api_client_tests/`             | FCR, mFRR, mixed, sync, rejection cases                                                    |
| `docs/`                              | resource docs, product type docs, changelog                                                |

## Open points for discussion

1. Sunset date for the deprecated mFRR columns. Should Phase 2 add a new
   `Api-Version`?
2. Keys: product type `business_id` (long but self-explanatory) or short
   aliases (`mfrr`, `fcr`)?
3. Column name: `application_details` or `product_details`? The second says
   more precisely that it holds the product sections, keyed by product type.
4. PostgREST or a Kotlin endpoint, see above.
5. Generated SQL validator or the `pg_jsonschema` extension?
6. Filtering on details, for example
   `application_details->automatic_frequency_containment->>limited_energy_reservoir`:
   do we need it, and does the Go proxy pass it through?

## Next step

A spike: add the components and run `just openapi` to check the generated TS,
zod and Kotlin output before starting the full implementation.
