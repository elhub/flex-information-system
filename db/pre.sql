-- extensions
\connect flex

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- noqa: RF05
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS ltree;

-- data schema
CREATE SCHEMA IF NOT EXISTS flex AUTHORIZATION flex;

-- logic schemas

DROP SCHEMA IF EXISTS api CASCADE;
CREATE SCHEMA IF NOT EXISTS api AUTHORIZATION flex;

DROP SCHEMA IF EXISTS logic CASCADE;
CREATE SCHEMA IF NOT EXISTS logic AUTHORIZATION flex;

DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION flex;

-- fresh start for policies
-- TODO each policy should be dropped IF EXISTS separately?
DO
$$
declare
   rec record;
begin
   for rec in (SELECT tablename, schemaname, policyname FROM pg_policies)
   loop
     execute 'drop policy "'||rec.policyname||'" on '||rec.schemaname||'.'||rec.tablename;
   end loop;
end;
$$;
