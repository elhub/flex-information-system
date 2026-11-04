# Frontend routing convention

Status: **draft, for discussion**

## TL;DR

* **Problem:** the same record has both nested and flat URLs, and which one
  you land on depends on where you clicked. Notices and events identify
  records as flat `/{resource}/{id}`, so a purely nested scheme is not
  possible.
* **Recommendation: flat only (option 1).** Every route is `/{resource}/…`.
  The parent is data on the record, not a path segment. Create and history
  take the parent as a query parameter.
* **Cost:** a one-off migration of link call sites. In return the copy-pasted
  nested `<Route>` blocks go away without a route generator.

## Problem

Routes in `frontend/src/resources/*` are inconsistent.

| Resource                                        | Nested routes                          | Flat routes                                    |
| ----------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `service_providing_group_product_application`   | show, print, create, edit              | list, show, print, create, edit, `:id/history` |
| `service_providing_group_grid_prequalification` | show, create, edit                     | list, show, create, edit                       |
| `service_providing_group_membership`            | show, create, edit, history            | show, create, edit, `:id/history`              |
| `controllable_unit_service_provider` (CUSP)     | list, show, create, edit, history      | list, show, create (no edit)                   |
| `technical_resource`                            | show, create, edit, history            | none                                           |
| `entity_client`, `party_membership`             | create, edit (membership also history) | none                                           |
| `*_suspension` (CU, SPG grid, SPG product)      | show, create, edit, history            | show, create, `:id/history`                    |

For example, the SPGPA list links to the flat show, while the SPG tab and
dashboard link to the nested show. Create is linked both flat and nested.

Boilerplate: about 25 copies of the same show/create/edit/history `<Route>`
block, hand-written post-save redirects, and an unused
`navigation/routeLabels.ts` that duplicates every nested path as a regex.

### Constraints

* **Flat identifiers.** Notices and events build `'/' || resource || '/' || id`
  (`db/api/event.sql`, `db/api/notice.sql`). Notice buttons link to
  `${source}/show`, so every notice source needs a flat show route: CU, CUSP,
  SPGPQ, SPGPA, SPG membership, SPPA and the suspension resources.
* **Parent id is already on the record** (`zod.gen.ts`). SPGPA, SPGPQ and
  print pages read only `:id` from the URL. Only parent-scoped pages read the
  parent from the URL: the `…_history` lists, the CUSP list, and the history
  button (which parses `location.pathname`).
* **Create has two entry points:** from a list (no parent) and from inside an
  SPG (nested URL). Both render the same form, which prefills from router
  state, not from the URL parameter. A pasted nested create link therefore
  opens with an empty SPG field (from reading the code, not yet run).
* **Suspensions** are little used but expected to grow, so they follow the
  same convention now.
* **Data access stays on react-admin**; layout is moving away from it. Few new
  resources are expected, so a written convention beats a generator.

## Options

### 1. Flat only (recommended)

Every route is `/{resource}/…`. The parent is a field on the record, or a
query parameter on create.

```text
/{resource}                         list (only where a list exists)
/{resource}/create[?{parent}_id=N]  create
/{resource}/:id/show                show (only where a show page exists)
/{resource}/:id/edit                edit
/{resource}/:id/print               action page
/{resource}_history[?{field}=…]     history list
```

Show routes exist only for resources with a show page. Resources that are
notice sources always need one (CUSP and SPG membership, for example).
`technical_resource`, `entity_client` and `party_membership` have no show
page (and will not get one) and are shown as tabs on the parent, so they get
no show route.

Pros:

* Matches react-admin and the notice and event identifiers, so notice links,
  shared buttons and `Datagrid` row clicks need no resolver.
* A child resource is a single `<Resource>`; the nested `<Route>` blocks
  disappear without a helper.
* One URL per record, so no ambiguity in "current page" logic.
* A pasted create link keeps the parent (today's nested link loses it).
* Parent-scoped and single-record history are the same flat list with a query
  parameter.

Cons:

* The parent is no longer in the URL. Child show pages need an explicit link
  back to it (they already have the id).
* All link call sites change once.

### 2. Hybrid: lists and create flat, records nested

```text
/service_providing_group_product_application                  list
/service_providing_group_product_application/create           create
/service_providing_group/:spgId/product_application/:id/show
/service_providing_group/:spgId/product_application/:id/edit
```

Create has no parent in the URL. The user picks the SPG in the form, or it is
prefilled from router state or a query parameter.

Pros:

* Close to SPGPA today, so fewer links change.
* The parent is visible in a record's URL.

Cons:

* Two URL styles per resource, and a rule to learn.
* Notice links to nested records need a redirect route per source, with an
  extra request on every click.
* Shared `EditButton`, `CreateButton` and `Datagrid` build flat URLs and need
  a nested-aware variant.
* Keeps the copy-pasted nested `<Route>` blocks.
* Post-save redirect from a flat create must build the nested URL from the
  new record's parent id, extra logic per resource.
* A user who cannot read the parent lands on a nested URL they cannot open.
  CUSP create has a `cuIDAsNumber` mode for this, and the SPGPA show throws if
  the SPG is unreadable. Back links and breadcrumbs would break (from code, not
  tested).
* Still needs the prefill fix for the SPG page entry point.

### Also considered: nested only

Child resources only under the parent, with flat URLs as redirects. Ruled out
because it leaves gaps that flat URLs have to fill anyway:

* It has no URL for the cross-parent list, or for create from a list or
  dashboard (no parent yet).
* Notice links would need a redirect per source.

## Keeping a later move to plain react-router cheap

Routing may leave react-admin's `<Resource>` some day. These rules cost
nothing now and keep that move small:

* Link to `/:id/edit` explicitly (`<Resource>` registers `:id/*`, a plain
  route does not).
* Always name the id parameter `id` (react-admin reads `useParams().id`).
* Read the parent id with `useSearchParams`, not react-admin helpers.
* Redirect after save with `useNavigate`, not the `redirect` prop.
* Avoid `useCreatePath`; use template strings or small path functions.

## Cross-cutting decisions

| Topic              | Recommendation                                                               | Alternative                         |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------------------- |
| Post-save redirect | One wrapper: back if there is in-app history, else record show or parent tab | `navigate(-1)` everywhere, as today |
| Old URLs           | Do not keep them. Notice and event identifiers are already flat              | Redirects for one release           |

## Open decisions

1. **Create without a parent.** Technical resource, entity client and party
   membership are only created from a parent. Should a missing
   `?controllable_unit_id=` redirect to the CU list, or show the picker as
   SPGPA and SPGPQ do from their lists?
