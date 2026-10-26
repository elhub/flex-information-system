# User interface implementation

We build a user interface at the same time as the flexibility information system
itself, because this project is carried out in coordination with other market
parties, and we want to make it as easy as possible to _visualise_ what is
present in the system and what happens when the API is called. It is not our
main task and is not where the value of the flexibility information system
stands, so we try to automate the front-end as much as possible.

We therefore use [React Admin](https://marmelab.com/react-admin/).
The front-end code is available under the `frontend` folder of the project.

## Resources and nested resources

Every resource in the database is associated to a [`Resource`](https://marmelab.com/react-admin/Resource.html)
in React Admin, with several pages according to the features we want for the
resource. These pages are grouped in a folder for every resource.
For instance, the pages for controllable units are under the
`controllable_unit` folder.

Here are the possible pages for a resource:

* a `List` page showing the [list](https://marmelab.com/react-admin/ListTutorial.html)
  of entries of this resource
* a `Show` page showing [details](https://marmelab.com/react-admin/ShowTutorial.html)
  about one record of this resource
* an `Input` page presenting input fields for the fields of this resource that
  can be [created or updated](https://marmelab.com/react-admin/EditTutorial.html)
* a `HistoryList` page showing the [list](https://marmelab.com/react-admin/ListTutorial.html)
  of entries of the _history_ of this resource

Resources can be [nested](https://marmelab.com/react-admin/Resource.html#nested-resources)
in React Admin, meaning that the underlying URLs are composed of several
resources. We use this feature to conceptually put relations under the database
resources. The pages for the nested resource are then located in a subfolder
of the resource folder.

For instance, consider the `controllable_unit_service_provider` relation
linking controllable units to service providers.
It makes more sense to display the various contracts linking a controllable
unit to service providers as a sub-component on the page of this controllable
unit, so we represent this relation as a `service_provider` nested resource
of `controllable_unit` in React-Admin, making it easier to handle it as a
sub-component.

Resources are grouped by domain under the `resources` folder of the
front-end (for instance, `resources/controllableUnitResources.tsx`), each
exporting a function that builds the `Resource` elements for that domain
based on the user's permissions. These are aggregated by `createAllResources`
and passed to the `Admin` component in `App.tsx`.

## Code factoring

In order to automate as much work as possible, we factor code under custom
components. For instance, the `Show` and `Input` pages of our components can
in fact be used for several purposes, limiting the amount of code we have to
maintain.

Indeed, the `Show` page can be used to show details about a record for _both_ a
resource and the history table of this resource. This is [made possible](https://marmelab.com/react-admin/Resource.html#resource-context)
by wrapping the component of this page under a `ResourceContextProvider` to
change the value of the `resource` property, and using `useResourceContext` in
the component to check whether it is used for the history or the main table, and
display or hide fields accordingly.

The `Input` page component can be wrapped under the [`Create`](https://marmelab.com/react-admin/Create.html)
or [`Edit`](https://marmelab.com/react-admin/Edit.html) components of
React-Admin, according to whether the input page is used to create a fresh
record or to edit an existing one. In the case of an edition, the various fields
of the input page will then be filled with the current values.

## Show page layout

New and migrated resource show pages use a consistent layout, provided by the
`ResourceShowLayout` component, to make the most important information easy
to find:

* The header identifies the record. For a non-application resource, such as a
  controllable unit or service providing group, it shows the resource name. For
  an application resource, it shows who the application is for; for example,
  an SPG product application is identified by the service providing group it
  belongs to. A status badge can be shown next to it, for resources that have
  a status.
* Actions are placed at the top right of the page. Primary, workflow-changing
  actions (such as activating a controllable unit) are shown directly as
  buttons, while secondary actions (such as editing the record) and
  navigation shortcuts to related resources (such as its events) are grouped
  in a single "More" dropdown menu, split in an actions and a navigation
  section.
* An optional alert banner can be shown below the header, for example to warn
  about a missing prerequisite.
* The summary card is placed to the left of the page content, listing the
  record's most important fields as label/value pairs. Extra controls, such
  as display unit, can be placed below the summary card.
* Tabs are placed to the right of the summary and contain the page's related
  information.

The older `ShowPageLayout` accepts generic React nodes for its badge, alerts,
action bar, title extras and two content panels, leaving each page to compose
its own layout. As a result, pages differed in how they presented content and
placed controls. For example, summary content was composed by each page, while
workflow actions could be supplied separately through the action bar and
history or event actions could be placed alongside the summary.

`ResourceShowLayout` standardizes the header, alert, action placement and
summary-field presentation. It uses structured, typed props such as
`ResourceStatus`, `AlertType`, `UtilityAction` and `ResourceSummaryField`.
Workflow and display controls can still be supplied by each page, but the layout
defines where they appear. Pages provide the tabs and define their content. Use
`ResourceShowLayout` for new resource show pages.

## List page layout

Top-level resource list pages use a consistent layout, provided by the
`ResourceListLayout` component in `components/list`. It is built from small
parts that only depend on the `ListInterface` contract
(`components/list/types.ts`), so the layout does not know where the data comes
from.

| Part                 | Responsibility                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ResourceListLayout` | Heading, optional actions (such as a create button) and composition of the parts below.                                                          |
| `ListFilters`        | Filter bar built from typed filter definitions (`text`, `select` or `multiselect`), with reset/clear buttons.                                    |
| `ListTable`          | Sortable table from column definitions. Handles error, loading and empty states. Rows can link to a show page, expand or have an actions column. |
| `ListPagination`     | Page selector and page size.                                                                                                                     |
| `useListState`       | Filter, sort and paging state, kept in the URL search params.                                                                                    |
| `useXxxList`         | Per-resource hook (for example `useControllableUnitList`) that fetches the data and returns a `ListInterface`.                                   |

`buildListQuery` in `components/list/postgrest.ts` translates the list state
into a PostgREST query, and is used by the per-resource hooks.

### Filters and default filters

Filters are keyed by a PostgREST-style source, such as `name@ilike` or
`status@in`. The filter state lives in the URL, so list pages are linkable and
survive navigation back from a show page.

A page can define default filters, for example showing only active controllable
units. They behave as follows:

* The defaults apply until the user changes a filter. At that point, the
  defaults currently shown are copied into the URL together with the change, so
  changing one filter doesn't silently drop the others.
* "Reset filters" goes back to the page's defaults. It is only enabled when the
  page has defaults and the current filters differ from them.
* "Clear filters" removes all filters, including the defaults.

### When to use it

`ResourceListLayout` is meant for top-level list pages. For tables embedded
elsewhere, such as in tabs on show pages, use `SimpleTable`, which takes data
that is already loaded and has no state of its own.
