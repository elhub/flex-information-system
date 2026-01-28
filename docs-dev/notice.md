# Notice

This document is about notices. It describes the constraints we have on this
resource and provides some detail about how we have implemented it - including
the reasoning behind our choices. To learn more about notices as a concept,
please head to the related page in the [concept
documentation](../docs/concepts/notification-and-notice.md).

## What are notices

Notices are used in FIS to flag inconsistencies, inactivity, or other issues
that need to be fixed by a specific party.

> A notice is a system-generated indication that a specific resource requires
> attention from a specific party due to an identified issue or inconsistency.

Notices are a crucial resource in our system because they can serve as the basis
for many _support features_. Notices can be a valuable source of _alerts_ and
visual information to guide users in resolving conflicts or fixing issues that
prevent a process from making progress.

Notices have several important characteristics:

* Notices always concern _one specific resource_ where an action is required.
  When it is an existing resource in the system, they must contain a _reference_
  to that resource.
* Notices are of different _types_.
  This helps the user understand what is actually wrong with the resource and
  how to fix it.
* Notices can contain additional _data_ to provide details about the problem.
* A notice is targeted to a specific _party_, so it must include a
  _reference_ to that party.
* Notices _cannot_ be created by users, they are discovered
  _by the system itself_ according to defined rules.

## Requirements

* There must be a mechanism to _scan_ various resources for inconsistencies.
  This mechanism depends on both the state of the database and the current
  timestamp.
* Notices should ideally be as up-to-date as possible, but the queries used to
  detect inconsistencies are _expensive_. Therefore, we need to find a
  _balance_ between freshness and performance. We see a need to schedule
  updates/checks at a reasonable frequency without overloading the system.
* Users must be able to query the resource _frequently_, with _good performance_.
* Users must be able to _filter_ notices by type and by resource.

## Future requirements

These are features we may want to implement in the future.

* When a user fixes an inconsistency, they must be able to ask the system for a
  _re-check_ of a specific notice.
* The targeted party should possibly be able to _ignore_ the notice if they
  consider it not important, false positive or know that it will eventually be
  resolved.

## Technical choices

This section documents the history of technical choices made on this resource,
helping the reader understand the reasoning behind our decisions.

### Notice resource fields

We are basing our design on our `events` resource, which again is based on CloudEvents.

Our `notice` resource has the following fields in the API:

* a `id` which is a unique surrogate identifier for the notice
* a `party_id` reference to the target party
* a `type` field to tell which type of notice this is
* a `source` URI-like field to identify the resource the notice concerns
* a `data` field to include some arbitrary details about the notice
* a `status` field to tell whether the notice is `active` or `resolved`. This
  can also be extended in the future to allow ignoring notices.

In addition we have audit-related fields such as `recorded_at` and
`recorded_by`.

#### Detecting notices

We _split_ the notice detection by _type_, with one _view_ for each type.
This is easier to maintain than a single view of several hundred lines.
In addition, when we want to check only _one_ notice type, we query
_much less data_.

#### Data access and storage

##### Separation between storage and API schema

We _split_ the `source` field in our `notice` table. We want the API to serve a
URI because users can directly reuse it to reach the resource and check what is
wrong, but we want efficient filtering. We reuse a pattern we have tested and
validated for this problem with _events_: we define `source_resource` and
`source_id` columns. This way, if we need to check a single resource, we can. A
`WHERE` clause filtering by resource and ID will likely be pushed down to the
view definition, generating notices only for the relevant resource instead of
generating all notices and then filtering. But we recombine those fields in the
`api` schema _view_ exposed to the API.

This way of storing the data will allow us to do an efficient re-check of a
single notice.

##### Indexing

We add an index on the `party_id` and `status` columns.
Notices will almost always be queried and filtered _by party_, because the rule
is that users can only read notices targeted at themselves.

We make it clear that the _frontend_ and _API users_ should also use this
filter, so as to help the query planner remove irrelevant rows at the _start_ of
the query instead of querying all notices and then going through row-level
security.

The status is also useful to have as part of the index because users will often
want to filter by `active` notices only.

### Audit and history

We want to keep track of when notices are created and resolved. To do this, we
enable the audit and history features on the `notice` table. This allows us to
track changes to notices over time, providing a clear record of when issues were
identified and resolved.

#### Deduplication and updates

Since notices are persisted, we need a mechanism to _update_ (resolve) existing
notices in the table and add new notices. This mechanism needs to be clever
enough not to _duplicate_ notices:

1. _new_ ones must be _created_ as _active_
2. _existing_ but not _detected_ must be updated as _resolved_
3. _existing_ and _detected_ must be updated if their `data` has changed
4. _resolved_ ones that are rediscovered must be _reactivated_

We are implementing update mechanism as a
[MERGE](https://www.postgresql.org/docs/current/sql-merge.html) statement. This
merge statement will compare the existing notices with the detected ones and
deduplicate them based on a set of columns: `party_id`, `type`, and a
`deduplication_key` column whose computation depends on the type of notice.
These columns can uniquely identify a notice and allow distinguishing between a
different notice or the same notice that got updated.
For now, we are forced to use a second `UPDATE` statement after it, because the
`MATCHED BY SOURCE` condition we would use to identify one of the cases is only
available from [v17](https://www.postgresql.org/docs/17/sql-merge.html) of
PostgreSQL.

When the ignore feature is implemented, we will use the `data` column to check
if a notice has changed, and possibly update from `ignored` to `active` if
needed.

#### Update schedule

We need to update all notices regularly. This looks like a _cron job_, but it is
most efficient if it runs directly inside the database, and it is less
maintenance work to avoid backend code for now. Indeed, we do not need to think
about programming languages, connection errors, threads or pods running the
worker, _etc_: everything runs directly from inside the database. The
[`pg_cron`](https://github.com/citusdata/pg_cron) library can be used for this
purpose.

As a starting point, we use a 15-minute period for updates, but we can
eventually split this into one job per notice type if we want, as the views got
split.

#### Cleaning

Records are _not cleaned automatically_ for now.
