# Technical Resource List Empty State

**Date:** 2026-03-26

## Goal

Add a meaningful empty state to the `TechnicalResourceList` component,
mirroring the pattern used in `ServiceProvidingGroupShowTable`. Currently
the list shows a generic "No results" text when empty.

## Pattern Reference

`ServiceProvidingGroupShowTable.tsx` — when the controllable units list is
empty:

- Shows `<BodyText>No controllable units in this group yet.</BodyText>`
- Shows an action `<Button variant="invisible" icon={...}>` only if the
  user has the relevant permission

## Approach: `emptyNode` prop on `Datagrid`

Extend the shared `Datagrid` component with an optional
`emptyNode?: ReactNode` prop. When the list is empty and `empty !== false`,
render `emptyNode` if provided, otherwise fall back to the existing
`<BodyText>No results</BodyText>` default. No breaking changes to existing
consumers.

## Changes

### 1. `frontend/src/components/EDS-ra/list/Datagrid.tsx`

- Add `emptyNode?: ReactNode` to `DatagridProps` and `DataTableProps`
- Thread `emptyNode` from `Datagrid` through to `DataTable`
- In `DataTable`, replace:

    ```tsx
    if (data.length === 0 && empty !== false) {
      return <BodyText>No results</BodyText>;
    }
    ```

    with:

    ```tsx
    if (data.length === 0 && empty !== false) {
      return emptyNode ? <>{emptyNode}</> : <BodyText>No results</BodyText>;
    }
    ```

### 2. `frontend/src/controllable_unit/technical_resource/TechnicalResourceList.tsx`

- Build an `emptyNode` variable mirroring the SPG pattern:
    - `<BodyText>No technical resources yet.</BodyText>`
    - If `canCreate`: a `<Button variant="invisible" icon={IconPlus}>`
      linking to the create route with the pre-filled
      `controllable_unit_id` location state, labelled
      "Create technical resource"
- Pass `emptyNode` to `<Datagrid>`
- Remove `empty={false}` from `<List>` (empty state now handled by
  `Datagrid`)

## Non-goals

- No changes to `List.tsx`
- No changes to other list consumers of `Datagrid`
- No new shared `EmptyState` component
