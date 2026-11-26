# Product-specific application details

> **Status:** Proposal for discussion. Nothing is implemented yet.

## TL;DR

* An **application** has **one or more product types**, from a fixed list of
  allowed combinations. Today: mFRR alone, FCR-N, FCR-D, or FCR-N and FCR-D
  together. More combinations (for example mFRR and mFRR-D) can be added later
  in `product-variants.yml`.
* The product-specific details are stored in **two new JSONB columns** on
  _Service Providing Group Product Application_ (SPGPA):
    * `application_details`: what the **applicant (SP)** asks for
    * `assessment_details`: the **procuring system operator's (PSO)** response
* Both are **polymorphic objects** with a `kind` discriminator. `kind`
  identifies the **variant**, which is derived from the product types.
* Variants are **typed**, defined in the OpenAPI spec and released with the
  API. The first ones are **mFRR** (existing fields moved in) and **FCR** (new,
  covers FCR-N, FCR-D or both).
* Models for the **frontend (TS + zod)**, **Kotlin (Fabrikt)** and the
  **Python test client** are generated from the spec.
* **Create and update are Kotlin endpoints** (`POST` and `PATCH`). They
  validate the details with the generated typed models and write through the
  existing database layer. Reads stay in PostgREST.
* The five current mFRR columns are **deprecated**, kept in sync for a
  transition period, and then removed.

## Terminology

| Term | Meaning |
| --- | --- |
| Application details | Product-specific input from the applicant (SP). |
| Assessment details | Product-specific response from the PSO, for example approved values. |
| Variant | The schema of the details for a product type or an allowed combination of product types, for example `spgpa_application_details_fcr`. |
| Section | A nested object in a variant with the fields of one product, for example `fcr_n` and `fcr_d`. |
| `kind` | Discriminator inside the details. Identifies the variant. |

## Background

Today SPGPA has five product-specific flat columns: `maximum_active_power_up`
and `_down` (NOT NULL), `ramping_capability` and `ramping_description`
(required for mFRR, VAL007/VAL008), and `additional_information`. In practice
they are all mFRR inputs, because mFRR is the only product type in use. FCR
needs other inputs, and some are set by the PSO and not the SP. More flat
columns per product type does not scale, and the API response would get more
and more `null` fields.

## Alternatives considered

|                        | A: Flat columns      | B: Runtime-dynamic schema | **B3: Typed variants (proposed)** |
|------------------------|----------------------|---------------------------|-----------------------------------|
| Storage                | one column per field | JSONB                     | JSONB                             |
| Schema defined in      | `resources.yml`      | data (`product_type`)     | OpenAPI components                |
| New product variant    | migration + code     | data change only          | spec change + release             |
| Generated typed models | yes                  | no                        | **yes**                           |
| Response shape         | many `null`s         | generic object            | **only the relevant variant**     |
| Effort                 | low                  | high                      | medium                            |

We don't need runtime-changeable variants, so B3 gives the benefits of B while
keeping typed models and documentation.

### Decisions already made

* **One or more product types per application, only from allowed
  combinations.** FCR-N and FCR-D share most data and are often assessed
  together. mFRR is not combined for now (see
  [mFRR and mFRR-D later](#adding-combinations-later-mfrr-and-mfrr-d)).
* **Discriminator (`kind`)** instead of an object keyed by product type, like
  `notice.data` and `event.data`.
* **FCR-N and FCR-D are separate product types.**
* **JSONB columns and Kotlin endpoints for create and update.** Typed models
  make the validation easier to write, test and give good error messages for.
  Validating in the database (generated plpgsql or `pg_jsonschema`) was
  considered and dropped.

Not decided yet, see the alternatives under
[Fields per variant](#fields-per-variant): how to model FCR-N capacity, and
sections vs a flat FCR variant.

## Product types

| Product | `business_id` | Change |
| --- | --- | --- |
| mFRR | `manual_frequency_restoration` | none |
| FCR-N | `automatic_frequency_containment` | existing row, name and products changed to FCR-N only |
| FCR-D | `automatic_frequency_containment_disturbance` | new row |

Reusing the existing `business_id` for FCR-N keeps ids stable. Changes go in
`db/flex/reference_data/product_type.csv`.

## Data model

```text
                       ┌──────────────────────────────┐
                       │ product_type                 │
                       └──────────────▲───────────────┘
                                      │ product_type_ids (1..n, allowed combination)
┌─────────────────────────────────────┴───────────────────────────────┐
│ service_providing_group_product_application                         │
│  id, service_providing_group_id, procuring_system_operator_id,      │
│  product_type_ids, status, ...                                      │
│                                                                     │
│  application_details  jsonb  ◄── NEW, written by the SP             │
│    { "kind": "<variant kind>", ...variant fields }                  │
│  assessment_details   jsonb  ◄── NEW, written by the PSO            │
│    { "kind": "<same as application_details>", ...fields }           │
│                                                                     │
│  maximum_active_power_up/down, ramping_capability,                  │
│  ramping_description, additional_information   ◄── DEPRECATED       │
└─────────────────────────────────────────────────────────────────────┘
```

**Rules:**

* `product_type_ids` has one or more elements, and all belong to the same
  variant.
* `application_details` is required if the variant has an application variant,
  and `null` otherwise. Its `kind` is the variant's `kind`.
* A section is present **if and only if** its product type is in
  `product_type_ids` (for example `fcr_d` only when FCR-D is applied for).
* `assessment_details` is `null` until the PSO responds, and always `null` for
  variants without an assessment variant. Its `kind` equals the `kind` of
  `application_details`, and the same section rule applies.

## Variants

### Connection between product types and variants

| Product types                  | `kind`                            | Application variant              | Assessment variant             |
|--------------------------------|-----------------------------------|----------------------------------|--------------------------------|
| mFRR                           | `manual_frequency_restoration`    | `spgpa_application_details_mfrr` | none                           |
| FCR-N, FCR-D, or FCR-N + FCR-D | `automatic_frequency_containment` | `spgpa_application_details_fcr`  | `spgpa_assessment_details_fcr` |

Defined once in a build-time file, `openapi/product-variants.yml`. The `kind`
reuses the `business_id` of the main product type of the variant (mFRR and
FCR-N). It identifies the variant, so it is also used when FCR-D is applied
for alone or together with FCR-N.

```yaml
- kind: manual_frequency_restoration
  product_types: [manual_frequency_restoration]
  application: spgpa_application_details_mfrr
- kind: automatic_frequency_containment
  product_types:
    - automatic_frequency_containment
    - automatic_frequency_containment_disturbance
  application: spgpa_application_details_fcr
  assessment: spgpa_assessment_details_fcr
  sections:                       # section -> product type that requires it
    fcr_n: automatic_frequency_containment
    fcr_d: automatic_frequency_containment_disturbance
```

`product_types` is the set that can be in one application for the variant (any
non-empty subset). Product types of different variants can't be mixed. The
generators use the file for the `oneOf` lists and discriminator mappings, the
Kotlin validation, the table above in the resource docs, and the frontend map
from `kind` to section components.

### Adding combinations later: mFRR and mFRR-D

mFRR and mFRR-D have the same fields, so the mFRR variant can stay flat, with
no sections and no new variant. Listing mFRR-D in the existing entry is
enough:

```yaml
- kind: manual_frequency_restoration
  product_types: [manual_frequency_restoration, manual_frequency_restoration_disturbance]
  application: spgpa_application_details_mfrr
```

The shape, the backfill and the legacy sync don't change. This only works if
**one set of values covers both products** (same up/down capacity and ramping
information). If not, the mFRR variant would need sections, which is a breaking
change, so confirm before mFRR is released flat (open point 7).

### Fields per variant

**Application details** (SP). All fields are required, except
`additional_information`.

| Property                               | Type                      | mFRR | FCR                  |
|----------------------------------------|---------------------------|------|----------------------|
| `kind`                                 | text (discriminator)      | ✅   | ✅                   |
| `maximum_active_power_up`              | decimal (kW)              | ✅   |                      |
| `maximum_active_power_down`            | decimal (kW)              | ✅   |                      |
| `ramping_capability`                   | enum always/partial/never | ✅   |                      |
| `ramping_description`                  | text                      | ✅   |                      |
| `additional_information`               | text (max 512), optional  | ✅   |                      |
| `service_provider_contact_information` | text                      |      | ✅                   |
| `technical_contact_information`        | text                      |      | ✅                   |
| `limited_energy_reservoir`             | boolean                   |      | ✅                   |
| `variable_production_consumption`      | boolean                   |      | ✅                   |
| `planned_prequalification_test_date`   | date                      |      | ✅                   |
| `fcr_n` (section)                      |                           |      | if FCR-N applied for |
| `fcr_d` (section)                      |                           |      | if FCR-D applied for |

| Section | Property                    | Type         | Rule                                                  |
|---------|-----------------------------|--------------|-------------------------------------------------------|
| `fcr_n` | `maximum_active_power`      | decimal (kW) | required                                              |
| `fcr_d` | `maximum_active_power_up`   | decimal (kW) | optional, but at least one of up and down is required |
| `fcr_d` | `maximum_active_power_down` | decimal (kW) | optional                                              |

**Assessment details** (PSO). Only the FCR variant has one for now, mFRR has
none yet. All fields are required once the PSO responds, for the sections that
are present: `fcr_n.approved_maximum_active_power` and
`fcr_d.approved_maximum_active_power_up/_down` (at least one).

Notes:

* The SP's organisation, party and name already exist in FIS (application →
  SPG → `service_provider_id` → `party`), so the UI shows them read-only. Only
  the contact person is entered.
* FCR form B is uploaded as an attachment, which already works.
* The shared FCR fields are stored once, also when both products are applied
  for. The FCR-N and FCR-D sections have different shapes and can have
  different values.

### Alternative: FCR-N capacity as up and down

The tables above model FCR-N with a single `maximum_active_power`, because
FCR-N is symmetric. The alternative is to use `maximum_active_power_up` and
`maximum_active_power_down` for FCR-N as well, with a rule that they must be
equal.

| | Single `maximum_active_power` (proposed) | Up and down, must be equal |
| --- | --- | --- |
| Matches the product | ✅ one value for a symmetric product | ⚠️ the same value entered twice |
| Data | ✅ stored once | ⚠️ stored twice, must be kept equal |
| "Equal" rule | ✅ not needed | ⚠️ can't be expressed in the schema, so Kotlin code and a manual zod refine |
| Shape of FCR-N and FCR-D | ⚠️ different (one value vs up/down) | ✅ same shape, the component can be reused with mFRR and FCR-D |
| FCR-D "up or down" rule | same in both | same in both |

Combining FCR-N and FCR-D in one application needs separate values per product
either way, because they can differ. So this choice doesn't remove the need for
sections or prefixed fields.

Open for review (open point 8).

### Alternative: flat FCR variant (without sections)

The FCR variant could instead be **flat**, like the mFRR variant and
`notice.data`, with a product prefix on the product-specific fields. Everything
else stays the same.

```json
"application_details": {
  "kind": "automatic_frequency_containment",
  "limited_energy_reservoir": false,
  "...": "...",
  "fcr_n_maximum_active_power": 1000,
  "fcr_d_maximum_active_power_up": 800,
  "fcr_d_maximum_active_power_down": 600
}
```

The assessment follows the same pattern (`fcr_n_approved_maximum_active_power`
and so on). In `product-variants.yml`, a `fields` map (field → product type)
replaces `sections`, and the validation checks per field instead of per section.

| | Sections (proposed) | Flat with prefixes |
| --- | --- | --- |
| Filling in the API | ⚠️ nested objects per product | ✅ one level |
| Which fields belong to which product | ✅ clear from structure | ⚠️ only from the prefix |
| "Present only if applied for" | ✅ one check per section | ⚠️ one check per field |
| "Up or down required" for FCR-D | ✅ `minProperties: 1` in the section | ⚠️ Kotlin code and a manual zod refine |
| Generated types | ⚠️ nested optional objects, check in the spike | ✅ flat |
| More products in the variant | ✅ a new section | ⚠️ top level grows |
| Consistency with mFRR and notices | ⚠️ new pattern | ✅ same flat style |

In both options the generated docs show the product fields as optional, because
"required if the product is applied for" depends on `product_type_ids` and
can't be expressed in the schema. The descriptions have to explain it.

Leaning: sections pay off with more products or fields. With two FCR products,
flat is simpler for API users and generators. Open for review (open point 9).

## Examples

The product type ids are illustrative.

### FCR-N and FCR-D together

The SP creates the application with `POST /service_providing_group_product_application`:

```json
{
  "service_providing_group_id": 18,
  "procuring_system_operator_id": 39,
  "product_type_ids": [6, 10],
  "application_details": {
    "kind": "automatic_frequency_containment",
    "service_provider_contact_information": "Kari Nordmann, +47 ...",
    "technical_contact_information": "Ola Nordmann, +47 ...",
    "limited_energy_reservoir": false,
    "variable_production_consumption": true,
    "planned_prequalification_test_date": "2026-12-01",
    "fcr_n": { "maximum_active_power": 1000 },
    "fcr_d": { "maximum_active_power_up": 800, "maximum_active_power_down": 600 }
  }
}
```

The PSO responds with `PATCH /service_providing_group_product_application/{id}`:

```json
{
  "assessment_details": {
    "kind": "automatic_frequency_containment",
    "fcr_n": { "approved_maximum_active_power": 900 },
    "fcr_d": { "approved_maximum_active_power_up": 700, "approved_maximum_active_power_down": 500 }
  }
}
```

For FCR-N only, `product_type_ids` is `[6]` and only `fcr_n` is sent. For
FCR-D only, it is `[10]` and only `fcr_d` is sent, and `fcr_d` may contain just
one direction.

### mFRR

mFRR has no assessment variant yet, so `assessment_details` stays `null`. If
mFRR gets one later, it is added as a variant in `product-variants.yml`.

```json
{
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

### Rejected requests

Illustrative messages. The final error format follows the other Kotlin
endpoints, and all errors in a request can be returned at once.

```text
product_type_ids is not an allowed combination of product types              (mFRR + FCR)
application_details.fcr_d is not allowed without product type automatic_frequency_containment_disturbance
application_details.fcr_n is required for product type automatic_frequency_containment
application_details.fcr_d must contain maximum_active_power_up or maximum_active_power_down
assessment_details.fcr_d is not allowed without product type automatic_frequency_containment_disturbance
```

### Updates replace the whole object

On `PATCH`, a details object is replaced as a whole, not merged. The SP sends
the full `application_details`, and the PSO the full `assessment_details`.
Each role only writes its own column, so they can't overwrite each other. If
the SP changes `product_type_ids` (for example adds FCR-D), the same request
must contain the matching `application_details`.

## OpenAPI and generated code

The variants are named components in `openapi/openapi-api-base.yml`. The union
components use `oneOf` with a `discriminator`, like `notice_data`:

```yaml
spgpa_application_details:
  oneOf:
    - $ref: "#/components/schemas/spgpa_application_details_mfrr"
    - $ref: "#/components/schemas/spgpa_application_details_fcr"
  discriminator:
    propertyName: kind
    mapping:
      manual_frequency_restoration: "#/components/schemas/spgpa_application_details_mfrr"
      automatic_frequency_containment: "#/components/schemas/spgpa_application_details_fcr"

spgpa_application_details_fcr:
  type: object
  additionalProperties: false
  required: [kind, service_provider_contact_information, ...]
  properties:
    kind: { const: automatic_frequency_containment }
    # shared fields ...
    fcr_n:
      type: object
      additionalProperties: false
      required: [maximum_active_power]
      properties:
        maximum_active_power: { type: number, format: decimal, minimum: 0, multipleOf: 0.001 }
    fcr_d:
      type: object
      additionalProperties: false
      minProperties: 1 # up, down or both
      properties:
        maximum_active_power_up: { ... }
        maximum_active_power_down: { ... }
```

`spgpa_assessment_details` is built the same way (only FCR for now, other
variants can be added). `fcr_n` and `fcr_d` are optional in the schema,
because whether they must be present depends on `product_type_ids`. The Kotlin
validation checks that. In `resources.yml`, both columns are nullable
references, like `notice.data`. Variant descriptions name their counterpart
("Answered by `spgpa_assessment_details_fcr`").

* **Frontend:** a union type and a `z.discriminatedUnion("kind", ...)` schema.
  The form has checkboxes for the product types, limited to the allowed
  combinations. `kind` is derived from the selection. For FCR it shows the
  shared fields once, plus a section per selected product. Deselecting a
  product removes its section. The PSO edits the assessment with one block per
  applied-for product, and the SP sees it read-only. The "up or down" rule needs
  a small manual `.refine`, because `minProperties` probably isn't generated.
* **Kotlin:** a sealed interface `SpgpaApplicationDetails` with
  `@JsonClassDiscriminator("kind")` and a data class per variant, for example
  `SpgpaApplicationDetailsFcr(fcrN: FcrN?, fcrD: FcrD?, ...)`. It probably
  needs the same `sed` fix as `NoticeData` in `generate-openapi-models.sh`. The
  assessment union has a single variant for now, so check that it still
  generates well.
  The endpoints use these models for request validation.
* **Translations and tooltips:** `resources_to_intl.py` covers the variant
  fields, including nested ones.

## Validation

Validation is done in the **Kotlin endpoints**, on the generated typed models.
The database keeps its existing triggers (status, SP002, ...) and the endpoints
write through `FlexTransaction` with `SET LOCAL ROLE`, so RLS and field-level
grants still apply. Frontend validation is only for user experience.

```text
  Frontend (zod)  ──►  Kotlin POST / PATCH                   ──►  Database
  UX only              1. parse into the typed variant           existing triggers,
                          (kind, fields, types, ranges)          RLS, field grants
                       2. business rules (below)
                       3. write in FlexTransaction
  GET / list      ──►  Kotlin pass-through  ──►  PostgREST (api view)
```

### Rules

The rules keep the ids VAL012 and VAL013 in the docs, but are implemented in
Kotlin.

**VAL012: allowed combination of product types.** `product_type_ids` keeps its
array type. It must have at least one element, no duplicates, and only product
types of the same variant according to `product-variants.yml`.

**VAL013: application and assessment details.**

1. `application_details` is required with the variant's `kind` if the variant
   has an application variant, and `null` otherwise.
2. A section is present if and only if its product type is in
   `product_type_ids`.
3. `assessment_details` is `null`, or the variant has an assessment variant,
   the `kind` matches `application_details`, and the same section rule applies.
4. Each object is valid against its variant: required fields, no unknown
   fields, types, `minimum`, `maximum`, `maxLength`, `minProperties`, `enum`.
   The typed models cover this. The rules that depend on `product_type_ids`
   (1–3) and the FCR-D "up or down" rule are Kotlin code.

VAL007 and VAL008 are **replaced** by VAL013, the `NOT NULL` on
`maximum_active_power_*` is removed, and the 512-character limit on
`additional_information` moves to `maxLength` in the mFRR variant.

Since Kotlin is the only validation, **all writes to SPGPA must go through the
endpoints**. PostgREST write access to the resource is removed, otherwise
direct requests could store invalid details.

### Who can write

Each column is authorized separately in `permissions.csv`:

| Party | `application_details` | `assessment_details` |
|-------|-----------------------|----------------------|
| SP    | R C U                 | R                    |
| SO    | R                     | R U                  |
| FISO  | R U                   | R U                  |

SP002 (an SP can only update while the status is `requested`) still applies to
`application_details`. OpenAPI's `readOnly` is **not** used for
`assessment_details`, because it would hide the field from the update request
for the PSO too. The generated field-level authorization table documents who
can write it.

## Migration and deprecation of mFRR columns

The five mFRR columns (`maximum_active_power_up`, `maximum_active_power_down`,
`ramping_capability`, `ramping_description`, `additional_information`) move
into `application_details` with `kind: manual_frequency_restoration`.

```text
  today              Phase 1 (release N)                          Phase 2 (sunset, N+x)
──────────┼─────────────────────────────────────────────────┼────────────────────────────
 flat     │ + application_details (backfilled from columns) │ columns removed from API,
 columns  │ + assessment_details                            │ table and history
          │ legacy columns: deprecated, nullable,           │ legacy mapping removed
          │   kept in sync both ways by the endpoints       │ changelog: "Removed ..."
          │ frontend uses the new columns only              │ (maybe new Api-Version)
          │ changelog: "Added ... / Deprecated ..."         │
```

Legacy sync in Phase 1, done by the Kotlin endpoints (old clients still send
the legacy fields) before the validation runs:

```text
 legacy columns changed?  application_details changed?  result
 ───────────────────────  ────────────────────────────  ─────────────────────────────────
 yes                      no                            copy columns → application_details
 no                       yes                           copy application_details → columns
 yes                      yes (same values)             ok
 yes                      yes (different values)        400 conflict
 non-mFRR application with legacy columns set           400
```

The backfill only applies to mFRR applications and also updates the **history
table**, so nothing is lost in Phase 2. The migration also counts and logs:

* non-mFRR applications with values in the legacy columns (only in history
  after Phase 2)
* applications with a product type combination that isn't allowed. VAL012 only
  applies to new and updated rows, so these stay as they are until updated.

## Endpoints

Create and update for SPGPA are implemented in Kotlin (Ktor), following the
attachments precedent (writes in Kotlin, reads in PostgREST).

* `POST /service_providing_group_product_application` and
  `PATCH /service_providing_group_product_application/{id}` keep the same path
  and body shape as today, so clients only see the new fields. They are
  explicit Kotlin routes, and the generic pass-through to PostgREST no longer
  handles writes for this resource. They need the same auth scope checks as
  the pass-through (`auth/scope`).
* `GET`, list, filtering, pagination, `select` and embedding stay in
  PostgREST on the `api` view.
* The endpoints write through `FlexTransaction` (`SET LOCAL ROLE`), so existing
  triggers, RLS and field-level grants in `permissions.csv` apply as before.
* Request and response schemas stay in the OpenAPI spec, and Fabrikt generates
  the Kotlin models the endpoints use.
* Kotlin can map the legacy fields per `Api-Version`, so the legacy sync is
  code and not a database trigger.
* `PATCH` also covers status changes, so those go through Kotlin too.

## Changes per area (Phase 1)

| Area | Change |
| --- | --- |
| `openapi/product-variants.yml` | new: `kind` → allowed product types, sections, application / assessment variant |
| `openapi/openapi-api-base.yml` | union components with discriminator, variants for mFRR and FCR, shared `ramping_capability` enum |
| `openapi/resources.yml` | add `application_details` and `assessment_details`; deprecate 5 fields |
| `local/scripts/resources_to_openapi.py` | build the `oneOf` lists and mappings from `product-variants.yml` |
| `db/flex/reference_data/product_type.csv` | FCR-N renamed, FCR-D added |
| `db/flex/..._migrations.sql` | new columns, drop NOT NULL, backfill (incl. history), drop VAL007/008 |
| `local/input/permissions.csv` | rows for `application_details` and `assessment_details`; remove PostgREST write access to SPGPA |
| `local/scripts/resources_to_intl.py` | labels and tooltips for variant fields |
| `kbackend/scripts/generate-openapi-models.sh` | possibly a `sed` fix for the sealed interfaces |
| `frontend/.../product_application/` | product checkboxes, section per `kind` and selected product, FCR-D up/down refine, PSO assessment section, show/print, draft migration |
| `kbackend` | regenerated models, `POST` and `PATCH` routes with validation (VAL012, VAL013), legacy mapping and auth scopes, and the pass-through no longer used for SPGPA writes, test data |
| `test/api_client_tests/` | mFRR, FCR-N, FCR-D, FCR-N + FCR-D, PSO response, legacy mapping, rejection cases; fixtures updated |
| `docs/` | resource docs incl. variant table, product type docs, changelog |

## Open points for discussion

1. Sunset date for the deprecated mFRR columns. Should Phase 2 add a new
   `Api-Version`?
2. Column names: `application_details` and `assessment_details`, or other
   names?
3. When can the PSO write `assessment_details`: at any status, or only from
   `prequalification`? Must it be set before `prequalified` for FCR?
4. Can the PSO give different outcomes per product in a combined application
   (approve FCR-N, reject FCR-D)? Status is per application, so no. Workarounds
   are an approved power of 0, or separate applications. If this is common,
   linked applications (one per product type) may fit better.
5. How is a prequalified application used downstream? Does anything assume a
   single product type in `product_type_ids`?
6. Can the SP add or remove a product while the status is `requested`? The
   proposal assumes yes. Must the PSO fill in approved values for every
   applied-for section, and may they include a direction the SP didn't apply
   for?
7. When mFRR and mFRR-D are combined later, will one set of values cover both
   products? If not, the mFRR variant needs sections, so better to know before
   it is released flat.
8. FCR-N capacity: a single `maximum_active_power`, or up and down with an
   equal rule? See
   [Alternative: FCR-N capacity as up and down](#alternative-fcr-n-capacity-as-up-and-down).
9. Sections or a flat FCR variant? See
   [Alternative: flat FCR variant](#alternative-flat-fcr-variant-without-sections).
10. Filtering on details, for example `application_details->>limited_energy_reservoir`:
    do we need it, and does the Kotlin pass-through to PostgREST support it?
11. Should the database keep a minimal safety net, for example a check that
    `application_details.kind` matches the product types, or is Kotlin the only
    validation?
12. Are there other writers to SPGPA than the frontend (integrations, scripts,
    status changes) that use PostgREST today and must move to the new
    endpoints?

## Next step

A spike: add the variant components, the discriminator and the two columns,
run `just openapi`, and implement `POST` for one variant in Kotlin. Check that:

* the discriminated union works in **request bodies** with all generators
  (TS/zod, Fabrikt, Python client). Our existing `oneOf` examples are
  read-only responses.
* Fabrikt produces a usable sealed interface, and whether it needs a `sed`
  fix.
* `deprecated: true` reaches the generated spec.
* optional nested sections and `minProperties` generate usable types in all
  generators.

If the discriminator works poorly in request bodies, the fallback is an object
keyed by variant (`mfrr`, `fcr`), with a single key.
