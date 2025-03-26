set client_min_messages to warning;
set search_path to gs1, public;
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
\i /db/pg_gs1/pg_gs1.sql
