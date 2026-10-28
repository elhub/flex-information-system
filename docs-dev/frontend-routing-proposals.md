# Frontend routing: proposals

Status: **draft, for discussion**

## Problem

Routes for resources in `frontend/src/resources/*` are inconsistent. Depending
on the resource, and on where the user navigates from, the same record can be
reached through a nested URL, a flat URL, or both.

Examples of what exists today:

| Resource                                        | Nested route                                   | Flat route                              |
| ----------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| `controllable_unit_service_provider`            | `/controllable_unit/:cuId/service_provider/…`  | `/controllable_unit_service_provider/…` |
| `service_providing_group_membership`            | `/service_providing_group/:spgId/membership/…` | `/service_providing_group_membership/…` |
| `service_providing_group_grid_prequalification` | nested                                         | flat (with list and create)             |
| `service_providing_group_product_application`   | nested                                         | flat (with list and `:id/print`)        |
| `technical_resource`                            | nested only                                    | none                                    |
| `entity_client`, `party_membership`             | nested only (create/edit, no show)             | none                                    |

Related inconsistencies:

* **Links disagree.** The SPGPA list links to the flat URL, while the dashboard
  and the SPG page link to the nested one. Notice and event "Go to resource"
  buttons use `${source}/show` (flat). The shared react-admin wrappers
  (`ResourceButton`, `CreateButton`, `EditButton`, `Datagrid`) build flat
  `/${resource}/…` URLs.
* **Edit URL.** Nested edit is `…/service_provider/:id`, flat edit is `/:resource/:id/edit`.
* **History URL.** Sometimes `…/x_history` (+ `…/x_history/:id/show`), sometimes
  `…/:id/history`.
* **Post-save redirect** is written by hand per route (`navigate(-1)`, `show`,
  `show?tab=…`, `list`).
* **Boilerplate.** The same show/create/edit/history `<Route>` block is
  copy-pasted ~25 times; `navigation/routeLabels.ts` duplicates every nested
  path as a regex.

## Goals

* One predictable URL per record, so links can be derived from the resource
  name rather than remembered.
* Less boilerplate when adding a resource.
* Breadcrumbs / labels that do not need a hand-written regex per route.
* Works with react-admin, which we are keeping, while we migrate layout away
  from it.

## Proposals

### A. Nested only for child resources

A resource that cannot exist without a parent lives under the parent. A
resource with its own identity is top-level.

```text
/controllable_unit                                   list
/controllable_unit/create
/controllable_unit/:id/show
/controllable_unit/:id/edit
/controllable_unit/:id/history

/controllable_unit/:cuId/service_provider/create
/controllable_unit/:cuId/service_provider/:id/show
/controllable_unit/:cuId/service_provider/:id/edit
/controllable_unit/:cuId/service_provider/:id/history
```

Flat URLs (`/controllable_unit_service_provider/:id/show`) are kept only as a thin
redirect to the nested URL, so notices, events and old bookmarks keep working.

Example registration:

```tsx
<Resource name="controllable_unit" list={…} show={…}>
  <ChildRoutes
    resource="controllable_unit_service_provider"
    path="service_provider"
    parentParam="cuId"
    show={ControllableUnitServiceProviderShow}
    input={ControllableUnitServiceProviderInput}
    history={ControllableUnitServiceProviderHistoryList}
  />
</Resource>
```

Pros:

* Parent is visible in the URL, which gives natural breadcrumbs and context.
* One canonical URL per record; easy to reason about.
* Matches how users think ("the service provider relation of this CU").

Cons:

* Needs the parent id to build any link. Notices/events only have `source`
  and an id, so they need a lookup or a redirect route.
* Shared react-admin buttons that build `/${resource}/…` need a nested-aware
  variant.
* Largest migration: all link call sites change.

### B. Flat only

Every resource is a top-level route. The parent is a field on the record or a
query parameter.

```text
/controllable_unit_service_provider/:id/show
/controllable_unit_service_provider/:id/edit
/controllable_unit_service_provider/create?controllable_unit_id=12
/controllable_unit_service_provider/:id/history
```

Example link:

```tsx
<Link to={`/controllable_unit_service_provider/${id}/show`} />
```

Pros:

* Matches how react-admin works out of the box; `ResourceButton`,
  `CreateButton`, `EditButton`, `Datagrid` need no changes.
* Link only needs resource name and id. Notices/events work as is.
* Smallest, simplest route table.

Cons:

* Parent context is lost from the URL; breadcrumbs must be derived from data
  (extra fetch) rather than the path.
* Create pages need the parent from a query param or router state, which is
  easy to drop.
* Existing nested URLs and the `routeLabels.ts` regexes have to be migrated or
  redirected.

### C. Hybrid with a clear rule: flat for lists/create, nested for records

Lists and cross-parent entry points are flat; once you are on a specific
record it is nested under its parent.

```text
/service_providing_group_product_application                list (all SPGs)
/service_providing_group/:spgId/product_application/create
/service_providing_group/:spgId/product_application/:id/show
/service_providing_group/:spgId/product_application/:id/edit
```

Pros:

* Fits resources that really have both a cross-parent list (SPGPA, SPGPQ) and
  a parent-scoped view.
* Less disruptive than A for existing list pages and dashboards.

Cons:

* Two URL styles for one resource, so the rule must be learned and enforced.
* Most likely option to drift back into today's inconsistency without tooling.

### D. Keep both, but generate them from one definition

Keep today's behaviour (nested and flat both reachable) but define each
resource once in a registry and generate routes and links from it.

```ts
export const routes = {
  controllable_unit_service_provider: {
    parent: "controllable_unit",
    segment: "service_provider",
    actions: ["show", "create", "edit", "history"],
  },
};

routes.show("controllable_unit_service_provider", { cuId, id });
// -> /controllable_unit/12/service_provider/34/show
```

Pros:

* Least behavioural change; no URLs break.
* Removes the copy-paste and the manual regexes.

Cons:

* Does not remove the ambiguity of two URLs per record; breadcrumbs and
  "current page" logic still have to handle both.
* Registry adds an abstraction to learn.

## Cross-cutting decisions (apply to any proposal)

| Topic             | Option 1                                          | Option 2                              |
| ----------------- | ------------------------------------------------- | ------------------------------------- |
| Edit URL          | `…/:id/edit` (explicit, matches react-admin)      | `…/:id` (current nested style)        |
| History URL       | `…/:id/history` and `…/:id/history/:hid/show`     | `…/x_history` (current nested style)  |
| Post-save target  | Parent show page with `?tab=…`                    | `navigate(-1)`                        |
| Old URLs          | Redirect to the canonical URL                     | Break (internal app, hash router)     |
| Route generation  | Helper/registry (`ChildRoutes`, `routes.show()`)  | Hand-written `<Route>`s               |

## Suggested rollout (any proposal)

1. Agree on the rule and the URL vocabulary above.
2. Add a small route helper and migrate `routeLabels.ts` to be derived from it.
3. Migrate one parent (e.g. `controllable_unit`) end to end as a reference.
4. Migrate remaining resources, adding redirects from old URLs.
5. Document the convention in `docs-dev/ui.md`.

## Open questions

* Are notices/events able to supply the parent id, or should they link through
  a redirect route?
* Do SPGPA and SPGPQ keep their own top-level lists?
* Do we need old URLs (bookmarks, emails) to keep working?
