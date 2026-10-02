# When to use this skill?
This skill is used when moving from ShowPageLayout.tsx component,
or when creating new show pages. Or when you want to know how a show-page should be structured.

# ResourceShowPageLayout usage
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

## Rules for the component

`mainHeaderText`- if a resource has defined a name in it, use that.
The header identifies the record.
For a non-application resource, such as a controllable unit or service providing group, it shows the resource name.
For an application resource, it shows who the application is for; for example, an SPG product application is
identified by the service providing group it belongs to.
- E.g. if a controllable unit is created with name "Solar" then
that is main header text.
- If a service providing group product appliction is created for a service providing group (SPG) named "Gruppe" then
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

`workflowActions` - is the primary actions on a resource. Such as approve or reject. Where approve is the primary type button
and reject is the secondary type. It always indicates what the next action should be on a resource. It should always be at least
one primary action.

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
Content of the tab is up to the implementation to define, but the ResourceShowPageLayout always expects tabs.

`displayControls` - currently only used for changing the display unit of the resource. between kW and MW.

### Other considerations
All text labels, headers, etc. must be translated to English and Norwegian.
