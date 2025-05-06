-- extensions
\connect flex

-- data schema
CREATE SCHEMA IF NOT EXISTS flex AUTHORIZATION flex;

-- logic schemas
DROP SCHEMA IF EXISTS api CASCADE;
CREATE SCHEMA IF NOT EXISTS api AUTHORIZATION flex;
GRANT USAGE ON SCHEMA api TO flex_anonymous;

DROP SCHEMA IF EXISTS auth CASCADE;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION flex;
GRANT USAGE ON SCHEMA auth TO flex_anonymous;

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
