# Notice

Notices are used in FIS to flag inconsistencies, inactivity, or other issues
that need to be fixed.
This document explains what technical constraints we have on this resource and
justifies the resulting technical choices we have made.
To learn more about notices as a concept, please head to the related page in the
[concept documentation](../docs/concepts/notification-and-notice.md).

## Requirements

Here are some of the requirements on notices we identified along the way:

* Notices always concern _one specific resource_ where an action is required.
  Therefore, they must contain a _reference_ to that resource.

* Notices can be of different _types_.
  This helps the user understand what is actually wrong with the resource and
  how to fix it.

* Notices can contain additional _data_ to provide details about the problem.

* A notice can be targeted to a specific _party_, so it can include a
  _reference_ to that party.

* The targeted party should ideally be able to _ignore_ the notice if they
  consider it not important or know that it will eventually be resolved.

* Notices _cannot_ be created by users, they are discovered
  _by the system itself_.
  There must be a mechanism to _scan_ various resources for inconsistencies.
  This mechanism depends on both the state of the database and the current
  timestamp.
  Polling for new notices is therefore a _never-ending_ process that produces
  different results each time.
  We should have a _worker_ responsible for updating notices.

* Notices are a crucial resource in our system because they can serve as the
  basis for many _support features_.
  Indeed, throughout the FIS, notices can be a valuable source of _alerts_ and
  visual information to guide users in resolving conflicts or fixing issues
  that prevent a process from making progress.
  Because of this, we should be able to query the resource _frequently_, with
  _good performance_.
  We should also be able to _filter_ notices by type and by resource.

* We should be able to ask the system for up-to-date information about whether
  a notice is _still active_ or if it has been _resolved_.

## Technical choices

This section documents the history of technical choices made on this resource,
helping the reader understand the reasoning behind our decisions.

### Experimental phase: single view

Our `notice` resource initially had 4 fields:

* a `party_id` reference to the target party
* a `type` field to tell which type of notice this is
* a `source` URI-like field to identify the resource the notice concerns
* a `data` field to include some arbitrary details about the notice

We started with a _view_ defined from _one query per type of notice_, collecting
everything with `UNION ALL` connectors.
This allowed us to _experiment_ with the concept without having to think about
updating a table.

Naturally, problems emerged over time.
The main problem is that with such a design, every time we query notices, we
recompute the _entire set of current notices_.
Indeed, filtering by _party_ is impossible before knowing the value of
`party_id`, which only comes when the notice is computed, as it is a view.
Filtering by _type_ seems inefficient to do because the `UNION ALL` structure
makes it _hard_ for the _query planner_ to optimise and understand that each
notice type only occurs once in the subqueries.
Last, filtering by resource is also inefficient because of the URI-like nature
of the field.
It makes the field computed instead of directly extracted from the tables.

Additionally, there were problems on the _frontend_ side because the resource
had no ID, making the single-ID read logic harder to implement.
We had to implement workarounds.

This first approach was therefore sensible to explore the concept, but not
future-proof.

### Iteration to prepare for production: persistent notices

The main change in this iteration is that we now _store_ notices.
The resource thus becomes _backed by a table_.

#### Resolved or not

We _keep track_ of whether notices are resolved or not with a `status` field.
We start with `active` and `resolved`, but this also allows us to easily
implement an _ignore_ feature later by adding an extra value to the
_enumeration_.

#### Index

We add an index on the `party_id` column.
Notices will almost always be queried and filtered _by party_, because the rule
is that users can only read notices targeted at themselves.

We make it clear that the _frontend_ and _API users_ should also use this
filter, so as to help the query planner remove irrelevant rows at the _start_ of
the query instead of generating all notices and then going through row-level
security.

#### Filtering and single check

We _split_ the notice generation by _type_, with one _view_ for each type.
This is easier to maintain than a single view of several hundred lines.
In addition, when we want to check only _one_ notice type, we query
_much less data_.

We also _split_ the `source` field.
Implementing it as a URI was useful because users can directly reuse it to reach
the resource and check what is wrong, but we want efficient filtering.
We reuse a pattern we have tested and validated for this problem with _events_:
we define `source_resource` and `source_id` columns.
This way, if we need to check a single resource, we can.
A `WHERE` clause filtering by resource and ID will likely be pushed down to the
view definition, generating notices only for the relevant resource instead of
generating all notices and then filtering.
But we recombine those fields in the `api` schema _view_ exposed to the API, so
the user does not see the difference with the previous design.

Both of these updates make it possible to check whether exactly _one_ notice has
been resolved or is still active, without computing unnecessary information in
the process.

#### Deduplication key

Since we want to store notices, we need a mechanism to _update_ the table and
add new notices.
This mechanism needs to be clever enough not to _duplicate_ notices:
_active_ ones should _not_ be _recreated_, and _resolved_ ones that are
rediscovered should _not_ be _recreated_ either (they should just be
_reactivated_).
However, we should not ignore a notice when it _needs_ to be recreated.
For example, when a notice was resolved but a _new_ problem _of the same kind_
arises _on the same resource_, we need to create a new notice.
It is possible to have two notices on the same resource for the same reason,
just happening at different times.
It is therefore useful to have a `key` field computed from the notice content to
ensure we do not duplicate notices.

In this iteration, the deduplication key is computed as a _hash_.
We take the `data` field into account to rule out cases where the same kind of
problem occurs on the same resource, but with different details in the
inconsistency.

#### Update procedure

We need to update all notices regularly.
This looks like a _cron job_, but it is most efficient if it runs directly
inside the database, and it is less maintenance work to avoid backend code for
this.
Indeed, we do not need to think about programming languages, connection errors,
threads or pods running the worker, _etc_: everything runs directly from inside
the database.
The [`pg_cron`](https://github.com/citusdata/pg_cron) library can be used for
this purpose.

As a starting point, we use a 15-minute period for updates, but we can
eventually split this into one job per notice type if we want, as the views got
split.

To compare freshly recomputed notices with existing notices, we first want to
avoid _quadratic complexity_, so we query both new and old notices
_exactly once_.
Then, we want to avoid _looping patterns_ to prevent calling a new update or
insert query _at each step_ of the loop.
It is much better to generate all the new or updated rows with a _single query_,
and then run a _bulk insert or update_.

#### Cleaning

Records are _not cleaned automatically_ for now.
We could imagine another job that deletes old data after some time to ensure
that old resolved notices do not take up too much space.
Now that we have introduced `pg_cron`, we can think about applying this
approach to other resources as well, such as events, notifications, and history
tables in general.
