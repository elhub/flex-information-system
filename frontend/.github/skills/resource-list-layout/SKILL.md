---
name: resource-list-layout
description: Build or migrate a top-level resource list page in frontend/src using ResourceListLayout, ListInterface and a useXxxList hook. Use when migrating a list from the react-admin List/Datagrid, when creating a new list page, or when you need to know how a list page should be structured.
metadata:
  version: "1.0.0"
---

# When to use this skill

Use this skill when migrating a top-level list page from the react-admin
`List` / `Datagrid` to `ResourceListLayout`, when creating a new list page, or
when you want to know how a list page should be structured.

Only for **top-level** list pages. Tables embedded in show pages (tabs) use
`SimpleTable`, not this layout. When migrating a list that can also be embedded
(via `useRecordContext`), do not carry the embedded mode over. Check that the
show page already has its own embedded table, and ask the user if not.

Background: `docs-dev/ui.md`, section "List page layout".

# Reference implementations

- `frontend/src/controllable_unit/ControllableUnitList.tsx` and
  `useControllableUnitList.ts` - default filters, embeds, role-dependent
  filters, CSV export, create actions.
- `frontend/src/service_providing_group/ServiceProvidingGroupList.tsx` and
  `useServiceProvidingGroupList.ts` - simple list, `expandedContent`.

Building blocks live in `frontend/src/components/list/`:
`ResourceListLayout`, `ListFilters`, `ListTable`, `ListPagination`,
`useListState`, `buildListQuery` (`postgrest.ts`) and the types in `types.ts`.

# Files for a list page

| File                 | Purpose                                                                          |
|----------------------|----------------------------------------------------------------------------------|
| `XxxList.tsx`        | Defines filters, columns and actions, renders `ResourceListLayout`.              |
| `useXxxList.ts`      | Fetches data with `useQuery` and returns `{ list: ListInterface<T> }`.           |
| `useXxxList.test.ts` | Tests for the hook (see "Tests").                                                |
| `xxxStatus.ts`       | Status to `StatusVariant` map, reused for the status filter and column.          |

Keep them next to each other in the resource folder. Register `XxxList` as the
`list` of the `Resource` in `resources/xxxResources.tsx` (usually already so).

# The hook: `useXxxList`

```typescript
export const useXxxList = () => {
  const state = useListState({
    defaultFilters: DEFAULT_FILTERS,            // optional
    defaultSort: { field: "id", order: "desc" },
  });
  const { filters, sort, page, perPage } = state;

  const query = useQuery({
    queryKey: ["<resource>", "list", { filters, sort, page, perPage }],
    queryFn: () =>
      listXxx({
        query: { ...buildListQuery({ filters, sort, page, perPage }), embed: "..." } as Query,
        headers: { Prefer: "count=exact" },
      }).then(getCountAndData),
    placeholderData: keepPreviousData,
  });

  const list: ListInterface<Xxx> = {
    ...state,
    rows: query.data?.data ?? [],
    total: query.data?.count ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
  return { list };
};
```

- Use the generated client (`listXxx` from `generated-client`), not the react-admin data provider.
- `Prefer: count=exact` is required for the total/pagination.
- `embed` brings in related records shown as columns. Only embed what the columns
  need. To filter on an embedded field, inner-join it with `!` so non-matching
  rows are dropped, e.g. `embed: "service_providing_group!(service_provider)"`.
- Filters are keyed by a PostgREST-style source `column@op` (`name@ilike`,
  `status@in`, `is_small`). `buildListQuery` turns them into query params.
  Embedded-field filters use a dotted path, e.g. `accounting_point.business_id@ilike`.
- The `Query` type helper is
  `NonNullable<Parameters<typeof listXxx>[0]>["query"]`.
- If an export is needed, also return `fetchAllForExport` (see CU hook). It
  must use the current filters and sort, but all pages.

# The component: `XxxList`

```typescript
return (
  <ResourceListLayout
    title={translate("text.<resource_plural>")}
    list={list}
    columns={columns}
    filters={filters}
    actions={actions}
    rowLink={(row) => `/<resource>/${row.id}/show`}
    expandedContent={...}   // optional
    rowActions={...}        // optional
  />
);
```

## Props

| Prop              | Required | Notes                                                                       |
|-------------------|----------|-----------------------------------------------------------------------------|
| `title`           | Yes      | Translated plural name of the resource.                                     |
| `list`            | Yes      | The `ListInterface` from the hook.                                          |
| `columns`         | Yes      | `ListColumn<T>[]`.                                                          |
| `filters`         | No       | `ListFilterDef[]`.                                                          |
| `actions`         | No       | Buttons at the top right (create, export). Omit when there are none.        |
| `rowLink`         | No       | Link to the resource's own show page: `/<resource>/${row.id}/show`. May also return `{ to, state }` to pass router state. Return `undefined` for rows that must not be clickable. |
| `expandedContent` | No       | Makes rows expandable. Only when there is useful related info (see SPG).    |
| `rowActions`      | No       | Per-row actions (e.g. a delete button) in their own trailing column. Return `null` for rows without an action; the column (empty header) is only rendered when at least one row returns something. Buttons here don't trigger `rowLink`. Don't put actions inside another column's `render`. |

## Filters

`ListFilterDef` (`components/list/types.ts`) is `text`, `singleselect` or
`multiselect`. Keep the filter type the old page used for each field. For new
fields, use the default in the table below. Single vs multi select varies per
page (e.g. a party can be either), so the table is only a default.

Each filter has a `source` of the form `<field>@<operator>`, e.g. `name@ilike`
or `status@in`. The operator is the PostgREST operator used in the query:
`ilike` = case-insensitive text match, `in` = value is one of the selected
options. Without an `@operator` the default is `eq` (exact match). Reuse the `source` from the old page's filter for the same field. Use the table only for new filters.

| Field                 | Default filter                                                                 |
| --------------------- | ------------------------------------------------------------------------------ |
| Name (free text)      | `text`, source `<field>@ilike`                                                 |
| Enum / status         | `multiselect`, source `<field>@in`. Options from `Object.keys(xxxStatusVariantMap)` or `zXxx.shape.field.options`, labelled `enum.<resource>.<field>.<value>` |
| Party                 | `multiselect`, source `<field>@in`, options from `usePartyOptions("<party_type>")` (`hooks/partyOptions`); pass `isLoading` |
| Boolean               | `singleselect`, source `<field>` (defaults to `eq`), with `"true"` / `"false"` options |

- Label: `translate("field.<resource>.<field>")`.
- Tooltip: optional `tooltip` on a filter (entries in `tooltip/tooltips`). Never
  add one by default; ask the user per filter whether it should have one.
- Role-restricted filters: spread conditionally on `identity?.role` (see
  `canFilterOnBrp` in the CU list).

**Prompt the user** only for which fields to filter on, which filters get a
tooltip, whether there are default filters, and the default sort. Don't suggest
defaults. Use the old page's `filters` as the starting list to show them. Ask
about the filter type only when there is no old filter to copy and the table
default is unclear (e.g. a party field that might be single select).

## Columns

`ListColumn<T>`: `header`, `render`, optional `sortField` (+ `sortType`
`"string" | "date" | "number"`).

- Header: `translate("field.<resource>.<field>")`.
- Render text with `BodyText size="small"`. Use `weight="semibold"` for the
  column that supplies the show page title (the page the row click opens). If
  the title is not a single column in the list, don't highlight any column.
  Missing values: a small `Dash` component
  (`<BodyText size="small">-</BodyText>`), defined in the file.
- Status: `StatusBadge` with the status map and
  `translate("enum.<resource>.status.<value>")`. If the resource already has a
  dedicated badge component (e.g. `SpgpaStatusBadge`, with tooltips), reuse it.
- Links to other resources: `Link as={RouterLink}` to that resource's show page.
- Dates: `toDateString` from `util` for date-only values, or `toDateTimeString` from `util` when the time should be shown too. Time-ranged embeds: `findCurrentlyValidRecord`.
- Power values: `formatScaled(value, "W", KILO)` from `utils/scales`.
- Set `sortField` only on columns that map to a real backend column. Embedded
  or computed columns are generally not sortable. No sortable columns is fine.

**Prompt the user** which columns the list should have and which should be
sortable. Don't decide on your own.

## Actions

Buttons from `components/ui` with `as={RouterLink}`, e.g. create:
`variant="primary"`, `icon={IconPlus}`. Gate on
`permissions?.allow("<resource>", "create")`. Secondary actions
(`variant="secondary"`, `variant="invisible"` for export with `IconDownload`).
Button text must be translated (`text.create` for the create button).
Icon-only buttons need an `aria-label` and a `Tooltip`; use
`className="text-semantic-background-action-danger"` for destructive ones.

# Rules

- Page `title`, button text and all labels must be translated in both English and
  Norwegian: `frontend/src/intl/text.ts` (`text.<name>`; the `text.` prefix is
  added by `translate`), `enum-labels.ts` for enums, `field-labels.ts` for
  fields. Reuse existing keys where they exist. A new `text.ts` key must be
  added to the `TextKey` union **and** both language maps.
- Row click goes to the resource's own show route
  (`/<resource>/${id}/show`).
- Never put filter/sort state in React state. It lives in the URL through
  `useListState`.

# Rows that are not backend data

If a list shows rows that don't come from the API (e.g. local SPGPA drafts), wrap
the `ListInterface` in a small hook: prepend the rows to `list.rows`, hide them
when a filter or page would exclude them. For `rowLink`, either return
`{ to, state }` for them (e.g. open the create page with the draft values) or
`undefined` and put links/buttons in the cells. Actions that only apply to these
rows (e.g. delete draft) go in `rowActions`, returning `null` for other rows. See
`service_providing_group/product_application/ServiceProvidingGroupProductApplicationList.tsx`.

# Removing the old implementation

When migrating, remove what the react-admin list used and nothing else uses:

- Imports and usage of `List`, `Datagrid`, `ReferenceField`, `TextField`,
  `DateField`, `StatusBadgeField`, `FunctionField`, `PartyReferenceInput`,
  `EnumArrayInput` etc. from `components/EDS-ra` / `react-admin`.
- `getFields(...)` / `useTranslateField` if no longer used.
- Check with grep before deleting a shared component (`ProductTypeArrayField`,
  status badges, hooks) that nothing else imports it.
- Keep the `Resource` registration (`list={XxxList}`) pointing at the new component.

# Tests

Test the `useXxxList` hook when it has non-trivial logic (default filters,
embed building, export), and any wrapper hook that adds extra rows (e.g. when
drafts are hidden by page or filters). Follow the `test-frontend-hooks` skill. The shared
parts (`useListState`, `buildListQuery`) already have tests, so do not repeat them.

# Verify

In `frontend/`:

```
npx tsc --noEmit
npm run lint
npm run test
```

Then check in the browser: filters, sort and paging update the URL, reload keeps
state, reset/clear filters work, row click opens the show page, and back
navigation restores the list.

# Migration checklist

1. Read the old list and note its filters, columns, actions, default sort and any special behaviour.
2. Ask the user about filters, defaults, columns and sortable columns.
3. Create `useXxxList.ts`.
4. Rewrite `XxxList.tsx` with `ResourceListLayout`.
5. Add translations (en + nb).
6. Remove unused old code.
7. Add hook tests if relevant.
8. Run tsc, lint, tests.
