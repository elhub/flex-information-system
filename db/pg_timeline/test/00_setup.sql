set client_min_messages to warning;
create extension if not exists pgtap;

-- lets verify that pgtap works
begin;
select plan(1);

select ok(
    now() = now(), -- noqa: ST10
    'now() = now() should return true'
);
select finish();
rollback;

-- load our functions
\i /pg_timeline/pg_timeline.sql
