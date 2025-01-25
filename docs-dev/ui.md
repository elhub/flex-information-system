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

Resources are listed in the main file of the front-end, `App.tsx`.

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
