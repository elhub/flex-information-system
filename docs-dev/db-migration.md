# Schema maintenance and migrations

We are using Liquibase for schema maintenance and migrations.

## What requires a migration

Writing migrations and maintaining a schema with _incremental_ changesets is
painful.
It is necessary, but not for all-the-things.

For example, any change to a _table_ in the `flex` schema requires a migration
because it will touch the data on the live environment when deployed.
On the contrary, changing a _view_ just changes the angle from which we see the
underlying data, so it has no impact on this existing data and can be changed
without a migration.

Generally, anything that lives _around_ the tables but does not belong to their
definition, like triggers, functions, _etc._, can be changed without a
migration.
This is also why a lot of SQL definitions leverage `IF NOT EXISTS`,
`CREATE OR REPLACE`, _etc_, as well as `runOnChange` in Liquibase.
Some types of objects (_e.g._, policies) are marked `runAlways` so we always
drop and recreate them.

## Writing the migration

Incremental changesets makes it harder to reason about the database objects
by just looking at the code.
Indeed, one then needs to read an initial table definition _and_ all the
migrations that were applied to it, to get an idea of what a table looks like.

Instead, we choose to also make the definition evolve alongside the migrations,
for documentation purposes, and also because this allows deleting the migrations
over time, once they have been run on the live environment.
However, this means the definition must only be run once, when the system is
launched for the first time.
Therefore, we mark the table definitions with `runOnChange:false`.

In order to apply a migration to a database table, you need to add a new
_changeset_ in Liquibase where the actual changes are made on the table.
We write those in plain SQL because it allows for more flexibility and is more
natural to write than "SQL-looking" YAML code for instance.
It starts by disabling the user-defined triggers on the table, if any:

```sql
ALTER TABLE flex.my_table DISABLE TRIGGER USER;
```

Then, you need to write the changes by one or several calls to `ALTER TABLE`.
More complex changes may require temporary fields or tables to be added, so that
arbitrary computations can be run to populate them on the side
(with `INSERT`/`UPDATE` statements) before actually erasing the former data.

Do not forget to also migrate elements that are directly linked to the table
definition, like constraints and history tables, and re-enable triggers after
everything is done.

## Registering the change

Once the migration is written as a changeset, you need to register it properly
in Liquibase.
The migration should be marked `runOnChange:false` like the table definitions,
as it is supposed to be run only once.
To identify whether it needs to be run, Liquibase _preconditions_ can be used.

For example, in the case of a migration changing the type of field `a` in table
`t` from `int` to `text`, we can know whether it has been already run or not yet
by checking the type of `t.a` in the `information_schema` schema in Postgres:

```text
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:'int'
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'flex' AND table_name = 't' AND column_name = 'a'
```

> [!WARNING]
> The Liquibase instructions above are shown on several lines for readability,
> but the whole query should be in a single SQL line comment for it to work.

Here, the precondition is true only if the type of `t.a` is `int`, which
corresponds to the state where the migration has never been run.

If the migration is written in an existing file, it should already be included
in a _changelog_, for example `flex/changelog.yml`.
But if it is big enough, the migration should live in its own file (_e.g._,
`t_migrations.sql`) starting with the following line:

```sql
--liquibase formatted sql
```

Then, the file should be added to the changelog with the following entry:

```yaml
- include:
  file: ./t_migrations.sql
  relativeToChangelogFile: true
```

## Testing the migration

To test that the migration works, you need to place yourself on the `main`
branch, run `just reload` to start from a clean pre-migration state.

Then, go to the branch containing the migration and run `just liquibase`.
Any errors there show an inconsistency introduced by the migration and must be
fixed before going forward.

If there is no error, then you can now introduce the new definition of the
table, to reflect the updates made by the migration.
Running `just reload` with both the updated table definition and the migration
should not throw an error, _i.e._, running the updated table definition
_instead of_ the former one + the migration should be equivalent seen by the
rest of the system.
Otherwise, it means the updated definition does not match the migration.

Also, changes should be brought to the API tests so that they follow the changes
applied to the database, and everything should of course remain green along the
way.
