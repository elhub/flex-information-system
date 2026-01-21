# Authorization model

We are providing a [resource-oriented main API](api-design.md). Authorization is
understood as allowing a user access to do an action on a resource or its field.

Our authorization model is based on a deny-by-default principle. This means that
authorization is denied unless explicitly allowed. We then allow certain
_actions_ on _resource_ or _field_ level for a specific _party type_. The caller
must also have the required _scope_ to perform the action.

You can think of a resource collection as a table. Each rows is a resource. Each
column is a field. We then specify Field Level and Resource Level Authorization
to give access to these resources.

The following examples shows a collection of resources `1`-`5`. The resources
have the fields `ID`, `A`, `B`, `C`, `D` and `E`. The colored boxes are read
(green) and update (yellow) policies for _one party type_. Dotted lines are
field level policies while solid lines are resource level policies.

There are three field level policies that allows read
access to all fields except `A` and update access to only `D`.

There are two resource level policies that allows read
access to resources `3`, `4` and `5`, and update access to only `5`.

Together, these policies allow the party type to read all fields except `A` of resources
`3`, `4` and `5`, and update only field `D` of resource `5`.

In addition to this, the user must have the required scope to perform the action.

![Resource and Field Level Authorization](../diagrams/auth-table.drawio.png)

More information about the policies and their implementation can be found in the
following sections.

## Scopes

Every combination of resource and action has a required scope. When a user makes
a request, the system will check that the session or token has that
scope. The requester can have multiple scopes. No scopes means no
access.

In our system, entities are made _members_ of parties to allow them to assume
the parties and act on behalf of them. The party membership is restricted with a
list of scopes. This allows fine-tuning the access control when the entity
assumes the party. Entity clients, allowing users to log in as entities in an
automated way, also contain scopes to limit what a machine can do in the system.

The purpose of this is e.g. to allow one person to be able to read data in the
system on behalf of a party, while another person can both read and write data.
This fits with the least privilege principle, where we try to give the user the
least amount of access.

A scope shows what the user can do to a specific resource. It is a
colon-separated string on the following format:

```html
<verb>:<module>[:<resource>]...
```

..and can be read as

> The user can `<verb>` `<resource>` in `<module>`.

Verb is the privilege or access level. Module and resource typically describe
the _asset_ or _path_ that is being protected are defined below. Resource is
optional and if omitted then it means "all resources".

### Verb

A verb specifies the type of access. The verbs are defined by the actions they
allow on the resource.

| Verb     | Description                            | Action(s)                          |
|----------|----------------------------------------|------------------------------------|
| `read`   | Read-only access                       | Read                               |
| `use`    | `read` plus calling RPCs (e.g. lookuo) | Read, Call                         |
| `manage` | Full access. `use` plus changing data  | Create, Read, Update, Delete, Call |

Since the access increases with `read` > `use` > `manage`, there is also
implicit inheritance. This e.g. means that a user with the `use` verb implicitly
has the `read` privilege.

### Module

A module is a logical grouping of resources. The currently defined modules are.

* `data` - This is the data API at `/api/`, for resources such as controllable
  units, service providing groups, etc.
* `auth` - This is the module for auth at `/auth/`.

### Resource

The resource part of the scope is used to make sub-scopes within a module. It is
optional and not yet implemented for clients. When omitted, the scope includes
everything in a the module.

The three dots `...` in the format above means that resources can be nested, to
create sub-scopes.

Each path on our API has a required scope, and every request is checked to see
that the client has a matching scope.

### Scope examples

The following are a few example scopes.

* `GET /api/v0/controllable_unit/` requires `read:data:controllable_unit`. It is
  also covered by e.g. `read:data` and `use:data` but not
  `manage:data:technical_resource`.

* `POST /api/v0/controllable_unit/lookup` requires `use:data:controllable_unit:lookup`.
  It is also covered by e.g. `manage:data` and `use:data:controllable_unit`.

### Scope assignment

Everytime a user changes identity in the system, they get assigned different
scopes.
These scopes are then held in the session/token.

This happens first when they log in as an entity.
If they log in through an entity client, they get the scopes associated to that
client.
Otherwise, they get the default scopes `manage:auth` and `manage:data`, which
are sufficient to assume a party and get read-write access to the resources in
the system.

This happens a second time when the user assumes a party.
If they assume a party that they own, then there scopes do not change.
If they assume a party they are a member of, then they get assigned the
_intersection_ of the scopes they had as an entity with the scopes granted by
the membership.
In other words, they keep the most powerful scopes from their entity while still
respecting the limitations set by the party membership.
Unassuming the party will reset the scopes to those the user would be granted if
logging in as an entity (through the entity client they provided, if they did).

This enables administrators to choose what each user can do on behalf of their
organisation, with the option of setting a different limit for each party,
_i.e._, set to what extent the user can exploit each responsibility the
organisation has in the market.
But this also allows the administrators for instance to set up a client so that
people can use the API to access the system in a read-only manner, thus reducing
the risks of editing sensitive data by mistake when accessing the system
programmatically.

## Party type check

The party type check is what is says the tin. It checks that the party type
doing the request is allowed to do the action on the resource. This is an
additional check added on just a few routes.

## Field Level Authorization (FLA)

We are basing FLA on an "authorization matrix". It is a table that shows which
actions are allowed for each party type on each resource field. The matrix shows
what each party type or anonymous users can do on each of the fields of the resource.

An example of an authorization matrix is shown below. This table shows that the
`id` field of resource `entity` is readable by all. The `name` field is
readable by all and can be updated and created by the `Service Provider`.
The `number` field of resource `invoice` can be created and read by
`Service Provider`, and read by `End User`, but `System Operator` cannot
interact with this field at all.

| Resource | Field  | Service Provider | System Operator | End User |
|----------|--------|------------------|-----------------|----------|
| entity   | id     | R                | R               | R        |
| entity   | name   | CRU              | R               | R        |
| invoice  | number | RC               |                 | R        |

The permission matrix is displayed as a markdown table in the give resources
docs page.

History resources inherit the authorizations from the main resource.

## Resource Level Authorization (RLA)

Resource level authorization is a way to control access to each resource as a
whole. As an example, a service provider should only be able to see the
controllable units that are assigned to them.

RLA is documented as a set of policies per resource and party type. We document this
as a list of textual policies per type, as shown for Service Provider (SP) and
System Operator (SO) in the example below.

| Policy key | Policy                                                   | Status  |
|------------|----------------------------------------------------------|---------|
| CU-SP001   | Read CU where they are SP. Only for the contract period. | PARTIAL |
| CU-SP002   | Create new CU.                                           | PARTIAL |
| CU-SP003   | Update CU where they are current SP.                     | PARTIAL |

| Policy key | Policy                                                       | Status  |
|------------|--------------------------------------------------------------|---------|
| CU-SO001   | Read and update CU that are connected to AP belonging to SO. | PARTIAL |

We name the policies in the format
`<Resource>-<Party Type Abbreviation><Number>`. The number is just used as a key
during discussions and serves as a way for us to document in the code what
policy is being implemented. It is also handy for code search.

Status can be one of:

* `PROPOSED` means that the policy is proposed but not decided.
* `TODO` means that the policy is not implemented yet.
* `PARTIAL` means that the policy is partially implemented.
* `DONE` means that the policy is fully implemented.

Policies can be in `TODO` or `PARTIAL` state either if we have not gotten to it
yet or the current platform does not support it (e.g. we are missing a
relation/entity).

### Time-dependent RLA

Some combinations of party type and resource have time-dependent access
policies.
In such cases, instead of controlling access in a binary way (the user can or
cannot see the resource based on some condition), access is _partially_ given,
on the part of the timeline where the user has the required contract.
This means that we need to make sure that _no stateful operations_ happening
outside of the allowed partial timeline are visible to the user.
This includes, for instance:

* _former versions_ of records erased before the start of the allowed timeline;
* _newer versions_ of records introduced after the end of the allowed timeline;
* records _deleted_ before the start of the allowed timeline;
* _new_ records created after the end of the allowed timeline.

A typical example is the service provider (SP) on a controllable unit
(CU). The SPs contract on the CU is time-dependent, with a valid from and to
date. This in turn means that the SP should only have update privileges to the
CU during the contract period, but should see the CU even after the contract has
ended. However, an old SP should not be able to see updates to the CU fields
done by a new SP, after their contract has ended.

Several strategies are in use to implement such constraints, simplifications
being possible in some cases depending on which operations are available on the
resource.

#### Method 1: Latest visible record

When fields on the resource are _not_ time-dependent, we must use audit history
to provide access when doing _read_ operations on the main collection/resource.
This means that we authorize data stored with record time based on the valid
time.
Access policies are implemented on both the main resource and its history table.
The history view exposed in the API makes a union of both, so we can see all
present and past records, all filtered by the policies we want on the resource.

Then, we can pick from this collection based on _time_.
For instance, we can see which records were active at a given time in the past
by filtering the _record time_ on each line.

The simplest filtering rule we can use is to just pick the
_latest visible record_.
This ensures that a user who can read the current records will see them instead
of historic values, and that conversely, if they cannot see the new ones, they
will see historic values presented as current records.

Let us take the example of the controllable unit resource where access for
service providers is based on CUSP contracts.

![Time-dependent RLA](../diagrams/time_dependent_authorization.png)

In this example we have 3 records in the data history for the CU. `3` is the
current record. Two service providers, `A` and `B`, have had contracts on the
CU. `B` is the current SP. Each of the service providers will see the latest
record that _overlaps with the end date on their latest contract_.

So, when each of the service providers does a `GET /controllable_unit/{id}` they
will see different records.

* `A` will see record `2`.
* `B` will see record `3`.

!!! note "Delete operation"

    A drawback of this method is that it does not handle *deleted* records well.
    Indeed, on resources with history enabled, when records are deleted, they
    are removed from the main table but kept in the history table.

    This means that the *latest visible version* filtering method takes the
    version of the record right before deletion and shows it in the main
    resource, instead of not showing it at all.

    Therefore, the current method cannot be used for resources supporting a
    delete operation.

#### Method 2: _As-of_ query

For resources that can be deleted, we introduce a more advanced mechanism.
Instead of taking the latest visible version of each record, we take all visible
records and only keep those that were _active at a certain date_, this date
being the latest point in the past where the user had a contract authorising
read access on the resource.
We call it the _as-of timestamp_, because conceptually this turns queries to
the resource into queries _as of_ this specific timestamp.

Let us take the example of a resource managed in turn by 4 users: D, A, B, C,
and then D again.

![asof_example](../diagrams/asof_example.png)

The resource has 3 records.
The first one is updated (marked by a colour change), then deleted while B
manages the resource; the second one is updated by A; the last one is created by
B and never updated.

We suppose the current date is 2020-07-09, midnight (marked with a change of
background color).

We need a definition for the as-of timestamp.
Let us take the timeline with all contracts for a given user.
Then we can define the as-of timestamp as the latest past point of this
timeline, _i.e._:

```text
min(max(contract_timeline), now)
```

This means that this date is the end of A's contract for A, and this timestamp
is just _now_ for all others (C and D having contracts in the future).
Both timestamps are marked with a dotted line.

This means that a query from A will give only 2 records, as R3 was not created
when A stopped being in charge.
Moreover, it will give R1 in its former state, because the update also happened
after their contract came to an end.

However, a query from one of the other users will give the latest state, _i.e._,
only R2 and R3, with R2 in its latest version.

It is possible to change or refine the definition of the as-of timestamp as
needed.
For instance, if future contracts (like the ones of C and D) are too far in the
future, it may be judged unfair to show the current data of the resource.
The current example is simplified by taking contracts that are very close to
each other in time.
