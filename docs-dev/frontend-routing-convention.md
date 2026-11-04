# Frontend routing convention

Status: **draft, for discussion**

## TL;DR

* The same record can be reached through nested and flat URLs, and the one you
  land on depends on where you clicked. Notices and events identify records
  by flat `/{resource}/{id}`, and the database builds that identifier from the
  table name and the child id alone. A purely nested scheme is therefore not
  possible.
* **Recommendation: flat only (option 2).** The parent is data on the record
  (`controllable_unit_id`, `service_providing_group_id`, …), not a path
  segment. Every route is `/{resource}/…`. History is a flat list,
  `/{resource}_history?…`, with the record or parent as a query parameter.
  Create takes the parent from a query parameter, for example
  `?service_providing_group_id=12`.
* A resource gets a flat `show` route only if it has a show page. Light
  children without one (`technical_resource`, `entity_client`,
  `party_membership`) are shown as tabs on the parent and have no show route.
  `controllable_unit_service_provider` and
  `service_providing_group_membership` keep their show pages, since notices
  link to them.
* This removes the copy-pasted nested `<Route>` blocks without adding a route
  generator. The convention is written down here and in `docs-dev/ui.md`.
* The cost is a one-off migration of the link call sites (listed at the end),
  and each parent-scoped page gets the parent from data instead of the URL.

## Problem

Routes in `frontend/src/resources/*` are inconsistent. Which URL a user ends
up on depends on where they navigated from.

| Resource                                        | Nested routes                          | Flat routes                                    |
| ----------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `service_providing_group_product_application`   | show, print, create, edit              | list, show, print, create, edit, `:id/history` |
| `service_providing_group_grid_prequalification` | show, create, edit                     | list, show, create, edit                       |
| `service_providing_group_membership`            | show, create, edit, history            | show, create, edit, `:id/history`              |
| `controllable_unit_service_provider` (CUSP)     | list, show, create, edit, history      | list, show, create (no edit)                   |
| `technical_resource`                            | show, create, edit, history            | none                                           |
| `entity_client`, `party_membership`             | create, edit (membership also history) | none                                           |
| `*_suspension` (CU, SPG grid, SPG product)      | show, create, edit, history            | show, create, `:id/history`                    |

Two examples of what is linked in the app today:

* **SPGPA.** The list links to the flat show. The SPG page tab and the
  dashboard link to the nested show, which links to nested edit and flat print.
  Create is linked both flat (dashboard, list header) and nested (SPG tab).
* **CUSP.** The CU tab uses nested edit, create and history. The flat show is
  reached only from notices and links to nested edit and history, because the
  flat resource has no edit route.

Other issues:

* **Edit and history shape.** Nested edit is `…/:id`, flat edit is linked as
  `/:resource/:id/edit`. react-admin registers edit as `:id/*`, so both work
  for flat resources. History is `…/x_history` or `…/:id/history`.
* **Boilerplate.** About 25 copies of the same show/create/edit/history
  `<Route>` block, hand-written post-save redirects, and
  `navigation/routeLabels.ts` duplicating every nested path as a regex. The
  file is not in use: nothing imports `getLabelForPath`.

### Constraints that shape the options

* Notices (`notice.source`) and events (`source`, `subject`) are built as
  `'/' || resource || '/' || id` (`db/api/event.sql`, `db/api/notice.sql`).
  Notice buttons link to `${source}/show`. Event filters match the same
  string (`source@eq`, `subject@eq`). The identifier must stay flat, and every
  notice source needs a flat show route. Today's notice types make these
  sources: CU, CUSP, SPGPQ, SPGPA, SPG membership, SPPA, and the suspension
  resources.
* Every child record already returns its parent id, per `zod.gen.ts`. The
  SPGPA, SPGPQ and print pages read only `:id` from the URL and take the SPG
  id from the record. Only the parent-scoped pages read the parent id from the
  URL: the `…_history` lists, the CUSP list, and the history button, which
  parses `location.pathname`.
* Create has two entry points. From a list there is no parent, and from
  inside an SPG the URL is nested. Both render the same form, which reads the
  prefill from router state (`useLocation().state`), never from the
  `:service_providing_group_id` URL parameter. A pasted nested create link
  therefore opens with an empty, editable SPG field (read from the code, not
  yet confirmed by running the app).
* The `*_suspension` child resources are not much used yet but are expected to
  be. They follow the same nested and flat pattern as the other children and
  get the same treatment, so the convention is in place before they grow.
* Data access stays on react-admin. Layout is being migrated away from it.
  Few new resources are expected, so a generator or registry pays off less
  than a written convention plus cleanup.

## Options

### 1. Nested only, with flat redirects

Child resources live under the parent. The flat URL stays only as a redirect
route that fetches the record, reads the parent id and navigates to the nested
URL.

```text
/controllable_unit/:cuId/service_provider/:id/show
/controllable_unit_service_provider/:id/show       (redirect)
```

Pros:

* The parent is visible in the URL and gives natural breadcrumbs.
* The CU tab history and create links are already nested.

Cons:

* Notices cannot link to the nested URL, so each notice source needs a
  redirect route. The user sees an extra request and a redirect on every
  notice link.
* Needs redirect routes for CUSP, SPG membership, SPGPA and SPGPQ, plus a flat
  fallback for every future notice source.
* The shared `EditButton`, `CreateButton` and `Datagrid` build flat URLs and
  need a nested-aware variant.
* The nested create route still ignores its URL parameter today, so the
  prefill has to be fixed anyway.
* Keeps the copy-pasted `<Route>` blocks.

### 2. Flat only (recommended)

Every route is `/{resource}/…`. The parent is a field on the record, or a
query parameter on create.

```text
/service_providing_group_product_application                list
/service_providing_group_product_application/create?service_providing_group_id=12
/service_providing_group_product_application/:id/show
/service_providing_group_product_application/:id/edit
/service_providing_group_product_application_history?service_providing_group_id=12
```

Pros:

* Matches react-admin and the notice and event identifiers. Notice links, the
  shared buttons and `Datagrid` row clicks need no resolver.
* The route table shrinks. A child resource is a single `<Resource>` with
  `list`, `show`, `edit` and `create`, and the nested `<Route>` blocks
  disappear without a helper.
* One URL per record, so there is no ambiguity in "current page" logic.
* A pasted create link keeps the parent if it is a query parameter.
  Today's nested link loses it.
* Parent-scoped history (all CUSP of one CU) and single-record history
  become the same flat list with a query parameter.
* Secondary benefit: the least work if routes later move from react-admin's
  `<Resource>` to plain react-router. A flat path is a path and a component,
  with no parent parameters, redirect resolver or path parsing to port (see
  "Keeping a later move to plain react-router cheap"). This is not the reason
  to choose it.

Cons:

* The parent is no longer in the URL. Child show pages need an explicit link
  back to the parent, which they already have the id for.
* Create pages need a rule for a missing parent (see the open decisions).
* All link call sites change once.

Target vocabulary:

```text
/{resource}                         list (only where a list exists)
/{resource}/create[?{parent}_id=N]  create
/{resource}/:id/show                show (only where a show page exists)
/{resource}/:id/edit                edit
/{resource}/:id/print               action page
/{resource}_history[?{field}=…]     history list
```

### 3. Hybrid: lists and create flat, records nested

```text
/service_providing_group_product_application                  list
/service_providing_group_product_application/create           create
/service_providing_group/:spgId/product_application/:id/show
/service_providing_group/:spgId/product_application/:id/edit
```

Create has no parent in the URL. The user picks the SPG in the form, or it is
prefilled from router state or a query parameter, as in option 2.

Pros:

* Roughly what SPGPA looks like today, so fewer links change.
* The parent is visible in the URL of a record.

Cons:

* Two URL styles per resource, and a rule that has to be learned.
* Notice links still need a resolver, as in option 1.
* The post-save redirect from a flat create has to build the nested URL from
  the created record's parent id. That is extra logic per resource that option
  2 does not need.
* A user who cannot read the parent ends up on a nested URL with a parent in
  the path that they cannot open. The CUSP create has a `cuIDAsNumber` mode
  for this case, and `ServiceProvidingGroupProductApplicationShow` throws if
  the SPG cannot be read. Back links and breadcrumbs from the nested URL would
  not work for them. This was read from the code, not tested with such a user.
* Still needs the prefill fix for the SPG page entry point.

## Keeping a later move to plain react-router cheap

Layout is moving away from react-admin, and routing may follow some day.
Nothing here depends on it, but a few rules cost nothing now and keep the
move small. The convention is the URL patterns. `<Resource>` is only how they
are registered today, and each resource maps to plain routes:

```tsx
<Route path="/x" element={<XList />} />
<Route path="/x/create" element={<XCreate />} />
<Route path="/x/:id/show" element={<XShow />} />
<Route path="/x/:id/edit" element={<XEdit />} />
```

* Link to `/:id/edit` explicitly. `<Resource>` registers `:id/*`, a plain
  route does not.
* Always name the id parameter `id`. react-admin's `Show` and `Edit` read
  `useParams().id`.
* Read the parent id with `useSearchParams`, not from react-admin helpers.
* Redirect after save with `useNavigate`, not react-admin's `redirect` prop.
* Avoid `useCreatePath`. Use plain template strings or small path functions.

Caveats:

* Each route still needs a `ResourceContextProvider` while react-admin's
  `Show`, `Edit` and `Create` are in use.
* Not tried: a plain `<Route>` around react-admin's `Edit` or `Create`. This
  is based on reading `ra-core`, so try it on one resource first.

## Cross-cutting decisions

| Topic                 | Recommendation                                                                        | Alternative                             |
| --------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| Edit URL              | `/:resource/:id/edit`. Already works (`:id/*`), and the shared `EditButton` builds it | `/:resource/:id`, react-admin's default |
| History URL           | `/{resource}_history?…`, list only (the parent or record is a query parameter)        | keep `/:id/history` for single records  |
| Post-save redirect    | One wrapper: back if there is in-app history, else record show or parent tab          | `navigate(-1)` everywhere, as today     |
| Create without parent | Parent from `?{parent}_id=`; the form shows the picker if absent                      | Redirect to the parent list if absent   |
| Old URLs              | Do not keep them. Notice and event identifiers are already flat                       | Redirects for one release               |
| Route generation      | Hand-written `<Resource>` blocks plus this document                                   | Helper or registry                      |

## Open decisions

1. Create without a parent. Technical resource, entity client and party
   membership are only created from a parent. Should a missing
   `?controllable_unit_id=` redirect to the CU list, or show the picker as
   SPGPA and SPGPQ do from their lists?
2. Whether a flat URL renders the record or redirects. Recommended: render it
   where a show page exists, and have no route where none exists. Not every
   child has a show page, and adding one (technical resource, entity client)
   is a UX question, not a routing one.
