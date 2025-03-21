# pg_audit

PG Audit is a set of fuctions and triggers used to track history in record time.

It is inspired by the
[Audit trigger](https://wiki.postgresql.org/wiki/Audit_trigger) from the
PostgreSQL wiki and
[nearform/temporal_tables](https://github.com/nearform/temporal_tables).

The purpose of this library is to provide a way to track changes in a table. It
will track the identity of the user that made the change and the time of the
change.

One can also track a previous version of the row that was changed in a
so-called history table.

The library expects that the table has the following columns

* `id` - a unique identifier for the row
* `record_time_range` - a tstzrange of time that the row is valid
* `recorded_by` - the identity of the user that created/updated the row

It also assumes that the history table shares the same name as the main table,
plus a `_history` suffix. If the main table is called `my_table`, the history
table should be called `my_table_history`.

The history table should have the same columns as the main table, plus

* `history_id` - a unique identifier for the history row
* `replaced_by` - the `id` of the user that put the row in the history

An example of how to create a history table is shown below.

```sql
CREATE TABLE IF NOT EXISTS
my_table_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'my_table',
            'id'
        )
    ),
    LIKE my_table,
    replaced_by bigint NOT NULL
);
```

There are basically two triggers that are provided by this library. The
`audit.current` is used before insert and update to set the `recorded_by` and
`record_time_range` column with the current user and time. The `audit.history`
is used after update and delete to move a copy of the replaced/deleted row to
the history table and, on the way, set the `replaced_by` column and update the
`record_time_range`.

Both trigger functions must be passed the name of a function that will return
the identity of the user that is making the change. This function must return
the identity of the user as a `bigint`.

An example of how to use the triggers is shown below.

```sql
CREATE OR REPLACE TRIGGER
my_table_audit_current
BEFORE INSERT OR UPDATE
ON my_table
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
my_table_audit_history
AFTER UPDATE OR DELETE
ON my_table
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
```
