# Design: Remove button on SPG show page CU list

**Date:** 2026-04-08

## Problem

The SPG show page has a read-only list of controllable units. To remove a CU
from the group, users must navigate to a separate "Manage members" page. The
goal is to add a Remove button directly on the show page list so users can
remove a CU without leaving the page.

## Context

- The remove functionality already exists end-to-end on the Manage Members page
  (`ExistingControllableUnitsTable.tsx` + `useRemoveMembership`).
- The show page uses its own data layer (`useSpgShowViewModel`) which does not
  currently carry the membership id needed to call
  `deleteServiceProvidingGroupMembership`.
- The `SimpleTable` component supports an `action` column alongside `rowClick`,
  so row navigation and a per-row action button can coexist.

## Design

### Data layer — `useSpgShowViewModel.ts`

1. Add `membershipId: number` to `SpgMembershipRow`. The membership record is
   already fetched in `fetchSpgShowData`; this is a one-line addition to the
   row mapping.
2. Export a new hook `useRemoveMembershipFromShow(spgId: number)` that:
   - calls
     `deleteServiceProvidingGroupMembership({ path: { id: membershipId } })`
     via `useMutation`
   - invalidates `spgShowViewModelQueryKey(spgId)` on settle

   The Manage Members page uses its own separate cache keys
   (`controllableUnitsInSpgQueryKey` / `controllableUnitsNotInSpgQueryKey`),
   so the two caches remain independent. Each invalidates only its own key.

### UI — `ServiceProvidingGroupShowTable.tsx`

1. Add a `canDelete` permission check for
   `service_providing_group_membership:delete` alongside the existing
   `canManageMembers` (`:create`) check.
2. Add a `DeleteButton` inner component that accepts `{ membershipId, spgId }`:
   - uses `useRemoveMembershipFromShow(spgId)`
   - wires up `useConfirmAction` with title `"Delete"` and content
     `"Are you sure you want to delete this item? This action cannot be
     undone."`
   - renders `<Button variant="caution">Remove</Button>`
   - same shape as `DeleteButton` in `ExistingControllableUnitsTable.tsx`
3. Add an `action` prop to the `SimpleTable`:
   - `render: (row) => canDelete ? <DeleteButton ... /> : null`
   - `header: ""`
4. The `rowClick` navigation to `/controllable_unit/:id/show` is unchanged.
5. The "Manage members" button remains for users who also have `:create`
   permission.

## Permissions summary

| Permission                                  | Grants                        |
| ------------------------------------------- | ----------------------------- |
| `service_providing_group_membership:create` | "Manage members" button       |
| `service_providing_group_membership:delete` | Remove button visible per row |

A user may have one, both, or neither.

## Out of scope

- No change to the Manage Members page or its hooks.
- No add-CU flow on the show page.
- No backend changes; `DELETE /service_providing_group_membership/{id}`
  already exists and is fully tested.

## Files changed

| File | Change |
| ---- | ------ |
| `frontend/src/service_providing_group/show/useSpgShowViewModel.ts` | Add `membershipId` to row type; add `useRemoveMembershipFromShow` hook |
| `frontend/src/service_providing_group/show/ServiceProvidingGroupShowTable.tsx` | Add `DeleteButton`; add `action` column; add `canDelete` permission check |
