-- extensions
\connect flex

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- noqa: RF05
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS ltree;

-- schemas
DO
$$
-- Create PostgreSQL ROLE (user) if it doesn't exist
-- https://stackoverflow.com/a/8099557
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'flex') THEN

      RAISE NOTICE 'Role "flex" already exists. Skipping.';
   ELSE
      BEGIN
         CREATE ROLE flex NOLOGIN;
      EXCEPTION
         WHEN duplicate_object THEN
            RAISE NOTICE 'Role "flex" was just created by a concurrent transaction. Skipping.';
      END;
   END IF;
END
$$;
CREATE SCHEMA IF NOT EXISTS flex AUTHORIZATION flex;

-- cleaup logic schemas
DROP SCHEMA IF EXISTS api CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;

-- cheanup roles
DO
$$
DECLARE
   role_name TEXT;
BEGIN
   FOREACH role_name IN ARRAY ARRAY[
      'api',
      'auth',
      'flex_anonymous',
      'flex_common',
      'flex_entity',
      'flex_balance_responsible_party',
      'flex_end_user',
      'flex_energy_supplier',
      'flex_flexibility_information_system_operator',
      'flex_market_operator',
      'flex_system_operator',
      'flex_service_provider',
      'flex_third_party',
      'flex_internal_event_notification',
      'flex_migrator']
   LOOP
      IF EXISTS (
         SELECT FROM pg_catalog.pg_roles
         WHERE  rolname = role_name) THEN

         EXECUTE 'DROP OWNED BY ' || role_name;
         EXECUTE 'DROP ROLE ' || role_name;
      END IF;
   END LOOP;
END
$$;

-- create logic schemas
CREATE ROLE api NOLOGIN;
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION api;

CREATE ROLE auth NOLOGIN;
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auth;

-- roles
CREATE ROLE flex_anonymous NOINHERIT NOLOGIN;
CREATE ROLE flex_common NOINHERIT NOLOGIN;
CREATE ROLE flex_entity NOLOGIN;
CREATE ROLE flex_balance_responsible_party NOLOGIN;
CREATE ROLE flex_end_user NOLOGIN;
CREATE ROLE flex_energy_supplier NOLOGIN;
CREATE ROLE flex_flexibility_information_system_operator NOLOGIN;
CREATE ROLE flex_market_operator NOLOGIN;
CREATE ROLE flex_system_operator NOLOGIN;
CREATE ROLE flex_service_provider NOLOGIN;
CREATE ROLE flex_third_party NOLOGIN;

-- internal system roles
CREATE ROLE flex_internal_event_notification;

GRANT flex_anonymous TO
flex_balance_responsible_party,
flex_end_user,
flex_energy_supplier,
flex_entity,
flex_flexibility_information_system_operator,
flex_market_operator,
flex_system_operator,
flex_service_provider,
flex_third_party;

GRANT flex_common TO
flex_balance_responsible_party,
flex_end_user,
flex_energy_supplier,
flex_flexibility_information_system_operator,
flex_market_operator,
flex_system_operator,
flex_service_provider,
flex_third_party;

-- https://postgrest.org/en/v12/how-tos/sql-user-management.html#sql-user-management
-- authenticator is used by PostgREST to connect to the database
DROP ROLE IF EXISTS postgrest_authenticator;
CREATE ROLE postgrest_authenticator NOINHERIT LOGIN PASSWORD NULL;

GRANT flex_anonymous TO postgrest_authenticator;
GRANT flex_balance_responsible_party TO postgrest_authenticator;
GRANT flex_end_user TO postgrest_authenticator;
GRANT flex_energy_supplier TO postgrest_authenticator;
GRANT flex_entity TO postgrest_authenticator;
GRANT flex_flexibility_information_system_operator TO postgrest_authenticator;
GRANT flex_market_operator TO postgrest_authenticator;
GRANT flex_system_operator TO postgrest_authenticator;
GRANT flex_service_provider TO postgrest_authenticator;
GRANT flex_third_party TO postgrest_authenticator;

-- internal system roles
GRANT flex_internal_event_notification TO postgrest_authenticator;

-- TODO Make functions non-public
-- https://postgrest.org/en/v12/explanations/db_authz.html#functions
-- ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Replication user used by event worker
DROP ROLE IF EXISTS flex_replication;
CREATE ROLE flex_replication REPLICATION NOINHERIT LOGIN PASSWORD NULL;

-- migration user
CREATE ROLE flex_migrator WITH NOINHERIT CREATEROLE LOGIN PASSWORD NULL;

GRANT flex TO flex_migrator;
GRANT api TO flex_migrator;
GRANT auth TO flex_migrator;

GRANT ALL ON SCHEMA public TO flex_migrator;
