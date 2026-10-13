---
name: resource-show-layout
description: Build or migrate a resource show page in frontend/src using ResourceShowLayout. Use when creating a new show page, replacing the legacy ShowPageLayout.tsx component, or when you need to know how a show page should be structured.
metadata:
  version: "1.0.0"
---

# When to use this skill

Use this skill when migrating a show page from the legacy `ShowPageLayout.tsx`
component to `ResourceShowLayout`, when creating a new show page, or when you
want to know how a show page should be structured.

# ResourceShowLayout usage
You can find a best-practice example in the file `frontend/src/controllable_unit/show/ControllableUnitShow.tsx`

```typescript
   <ResourceShowLayout
      secondaryHeaderText={`${translate("text.controllable_unit")} #${cu.id}`}
      mainHeaderText={cu.name}
      alert={alert}
      status={{
        label: translateEnum(`controllable_unit.status.${cu.status}`),
        status: cuStatusVariantMap[cu.status].status,
        icon: cuStatusVariantMap[cu.status].icon,
      }}
      moreActions={[
        {
          to: `/controllable_unit/${cu.id}/edit`,
          title: translate("text.edit"),
          icon: <IconPencil />,
          shouldShow: canEdit ?? false,
        },
      ]}
      moreNavigationActions={[
        {
          to: `/event?filter=${eventsFilter}`,
          title: translate("text.events"),
          shouldShow: canReadEvents ?? false,
        },
      ]}
      workflowActions={
        cu.status === "new" ? (
          <ActivateControllableUnitButton
            controllableUnitId={cu.id}
            disabled={!canActivateControllableUnit}
          />
        ) : undefined
      }
      summary={summary}
      content={<ControllableUnitShowTabs cuId={cu.id} viewModel={viewModel} />}
    />
```

## Props: required and optional

| Prop                    | Required | Notes                                                                                   |
|-------------------------|----------|-----------------------------------------------------------------------------------------|
| `secondaryHeaderText`   | Yes      | Resource type and internal id.                                                          |
| `mainHeaderText`        | Yes      | Identifies the record.                                                                  |
| `summary`               | Yes      | Array of label/value fields. Each field has an optional `shouldShow` (default `true`).  |
| `content`               | Yes      | Must be an EDS `Tabs` element.                                                          |
| `status`                | No       | Omit if the resource has no status. Optional `icon` and `tooltip`.                      |
| `alert`                 | No       | Omit when there is nothing to highlight.                                                |
| `workflowActions`       | No       | Omit when no workflow action is available.                                              |
| `moreActions`           | No       | Each action's `shouldShow` is optional but defaults to `false` (hidden if omitted).     |
| `moreNavigationActions` | No       | Same as `moreActions`. The "More" menu is hidden if no action is visible.               |
| `displayControls`       | No       | Currently only the kW/MW display unit toggle.                                           |

Optional fields on the nested types:

- `alert`: `severity` is required, `body` is required, `heading` is optional.
- `status`: `label` and `status` are required, `icon` and `tooltip` are optional.
- Action (`moreActions` / `moreNavigationActions`): `to` and `title` are required.
  `icon`, `external` and `shouldShow` are optional.

## Files to create for a new show page

Mirror the layout of `frontend/src/controllable_unit/show/`:

| File                          | Purpose                                                                          |
|-------------------------------|----------------------------------------------------------------------------------|
| `XxxShow.tsx`                 | Fetches data, handles loading/error, renders `ResourceShowLayout`.               |
| `useXxxViewModel.ts`          | `useQuery` hook that gathers the resource and all related data for the page.     |
| `components/XxxAlerts.tsx`    | `useXxxAlerts(viewModel)` hook returning `AlertType \| undefined`.               |
| `XxxShowSummary.tsx`          | `useXxxShowSummary({ viewModel })` hook returning `ResourceSummaryField[]`.      |
| `XxxShowTabs.tsx`             | The `Tabs` element passed as `content`.                                          |
| `xxxStatus.ts`                | Status map from the resource status to a `StatusVariant` (if it has a status).   |

## Page skeleton

Call all hooks first, then handle loading and errors, then compute permissions
and render. Hooks must not be called after an early return.

```typescript
const { data: viewModel, isPending, error } = useXxxViewModel(id);
const alert = useXxxAlerts(viewModel);       // hooks accept an undefined view model
const summary = useXxxShowSummary({ viewModel });

if (error) throw error;
if (isPending) return <Loader />;
if (!viewModel) return null;
```

Both `useXxxAlerts` and `useXxxShowSummary` must handle `undefined` (return
`undefined` and `[]` respectively), because they run before the data is loaded.

## Status map

`status` takes `{ label, status, icon?, tooltip? }`.

- `label` - translated enum label, `translateEnum("<resource>.status.<value>")`.
- `status` - one of `"ongoing" | "failed" | "approved-with-warning" | "approved" | "stopped" | "temporarily-stopped"`.
- `icon` - an icon component from `@elhub/ds-icons`.
- `tooltip` - optional text shown on hover.

Define a `Record<ResourceStatus, StatusVariant>` per resource (`StatusVariant` is
exported from `components/StatusBadge`). Example, `cuStatusVariantMap` in
`controllable_unit/controllableUnitStatus.ts`:

```typescript
export const cuStatusVariantMap: Record<ControllableUnitStatus, StatusVariant> = {
  new: { status: "ongoing", icon: IconStopWatch15 },
  active: { status: "approved", icon: IconQualitiesCircle },
  inactive: { status: "temporarily-stopped", icon: IconCross },
  terminated: { status: "stopped", icon: IconCrossCircle },
};
```

## Permissions and `shouldShow`

Get permissions with `usePermissions<Permissions>()` from `ra-core`. `allow()` can
return `undefined`, so coerce to a boolean for `shouldShow`:

```typescript
const canEdit = permissions?.allow("controllable_unit", "update") ?? false;
const canReadEvents = permissions?.allow("event", "read") ?? false;
```

Remember that `shouldShow` defaults to `false` for `moreActions` and
`moreNavigationActions`, so always set it explicitly.

## Events link

The events navigation action links to the event list filtered by source. The filter
is URL-encoded JSON, and the source is `/<resource>/<id>`:

```typescript
const eventsFilter = encodeURIComponent(
  JSON.stringify({ "source@eq": `/controllable_unit/${cu.id}` }),
);
// to: `/event?filter=${eventsFilter}`
```

## Summary fields

`summary` is `ResourceSummaryField[]`: the props of `LabelValue` plus `shouldShow`.
`LabelValue` props:

- `labelKey` - a translated field label key (`FieldLabel` or `TooltipKey`), or `label` for a plain string.
- `value` - string, number or a React node.
- `link` / `linkText` - make the value a link. Prefer this to putting a link in the node.
- `unit`, `storageScale`, `displayScale` - unit conversion (see `displayControls`).
- `tooltip` - show the field tooltip next to the label.

`ResourceSummaryPanel` already sets `size="large"` on each field.

## Tabs

Import `Tabs` from `components/ui` (not from EDS directly). Use `useTabSearchParam`
(`hooks/useTabSearchParam`) so the selected tab is kept in the URL (`?tab=...`).
Hide tabs the user may not see by checking permissions in `XxxShowTabs`.

## Rules for the component

`mainHeaderText`- if a resource has defined a name in it, use that.
The header identifies the record.
For a non-application resource, such as a controllable unit or service providing group, it shows the resource name.
For an application resource, it shows who the application is for; for example, an SPG product application is
identified by the service providing group it belongs to.
- E.g. if a controllable unit is created with name "Solar" then
that is main header text.
- If a service providing group product application is created for a service providing group (SPG) named "Gruppe" then
mainHeaderText="Gruppe".
- Accounting Point does not have a name, then the business id is used.

**Important**: If you are unsure about naming, always prompt the user to ask what's correct. Don't suggest options.
Let the user decide.

`secondaryHeaderText` - is always set to resource type together with the internal id. E.g. `Controllable unit #1`.

`alert` - is individual for each resource, the purpose of the alert is to highlight any issues related to the resource.
Prompt the user if there exists any alerts that one should be aware of.

`status` - is always used for the main resource of the page, each resource has its own status configuration.
Prompt the user if there are any relevant statuses for the resource.

`moreActions` - actions on a resource which are not that important, typically this can be edit resource, print etc.
You can see this as "secondary" action. Prompt the user what actions a resource should have.

`moreNavigationActions` - is in the same menu as moreActions. These are links to other pages related to this resource.
Such as events.

`workflowActions` - Use for the primary action that advances the resource's workflow, such as approve or reject. Include it
when a workflow action is available; otherwise, omit it. Don't add an unrelated action just to fill this area. When multiple
actions are available, make the primary action visually primary and secondary actions visually secondary.

`summary` - a label value pair of information on the resource of the page. The information here must be relevant for the user
when navigating between tabs on the page. Never put navigation, actions or links here.

`content`- Should always be tabs from EDS. E.g:

```typescript
    <Tabs defaultValue='email'>
      <Tabs.List>
        <Tabs.Tab value='email' label='Emails' />
        <Tabs.Tab value='read' label='Read' />
        <Tabs.Tab value='unread' label='Unread' />
      </Tabs.List>
      <Tabs.Panel value='email'>Panel for Emails</Tabs.Panel>
      <Tabs.Panel value='read'>Panel for Read emails</Tabs.Panel>
      <Tabs.Panel value='unread'>Panel for Unread emails</Tabs.Panel>
    </Tabs>
```
Content of the tab is up to the implementation to define, but the ResourceShowLayout always expects tabs.

`displayControls` - currently only used for changing the display unit of the resource. between kW and MW.

### Translations

All text labels, headers, etc. must be translated to English and Norwegian.

- General text: `frontend/src/intl/text.ts`, key `text.<name>` (e.g. `text.controllable_unit`, `text.edit`).
  The `text.` prefix is added by `translate`, the entries themselves are keyed without it.
- Enum labels (statuses): `frontend/src/intl/enum-labels.ts`, key `<resource>.status.<value>`.
- Field labels: `frontend/src/intl/field-labels.ts`.

Add the entry to both the English and the Norwegian section.
