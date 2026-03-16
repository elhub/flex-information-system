-- Postgres init script for Testcontainers.
-- Runs as the 'postgres' superuser after the 'flex' database is created.
-- Creates all extensions, roles, and the initial flex schema that Liquibase
-- migrations depend on.  Mirrors local/postgres/init.sql but omits pg_cron
-- (not available in the standard postgres:17 image).

-- flex is the main application role; it owns all schemas
CREATE ROLE flex WITH NOINHERIT LOGIN PASSWORD 'flex_password';
GRANT CREATE ON DATABASE flex TO flex;
CREATE SCHEMA IF NOT EXISTS flex AUTHORIZATION flex;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS ltree;

-- party / role hierarchy
CREATE ROLE flex_authenticator WITH NOINHERIT LOGIN PASSWORD 'authenticator_password';
CREATE ROLE flex_anonymous WITH NOINHERIT NOLOGIN;
CREATE ROLE flex_balance_responsible_party WITH NOLOGIN;
CREATE ROLE flex_common WITH NOLOGIN;
CREATE ROLE flex_end_user WITH NOLOGIN;
CREATE ROLE flex_energy_supplier WITH NOLOGIN;
CREATE ROLE flex_entity WITH NOLOGIN;
CREATE ROLE flex_flexibility_information_system_operator WITH NOLOGIN;
CREATE ROLE flex_market_operator WITH NOLOGIN;
CREATE ROLE flex_organisation WITH NOLOGIN;
CREATE ROLE flex_service_provider WITH NOLOGIN;
CREATE ROLE flex_system_operator WITH NOLOGIN;
CREATE ROLE flex_third_party WITH NOLOGIN;

CREATE ROLE flex_staging_structure_data WITH NOINHERIT
LOGIN PASSWORD 'staging_structure_data_password';

CREATE ROLE flex_internal WITH NOINHERIT NOLOGIN;

CREATE ROLE flex_operation_readonly WITH NOINHERIT NOLOGIN BYPASSRLS;
CREATE ROLE flex_operation_update WITH NOINHERIT NOLOGIN BYPASSRLS;
CREATE ROLE flex_operation_readwrite WITH NOINHERIT NOLOGIN BYPASSRLS;

CREATE ROLE flex_internal_event_notification WITH NOLOGIN;
GRANT flex_internal TO flex_internal_event_notification;

-- authenticator can SET ROLE to any party role
GRANT flex_anonymous TO flex_authenticator;
GRANT flex_balance_responsible_party TO flex_authenticator;
GRANT flex_end_user TO flex_authenticator;
GRANT flex_energy_supplier TO flex_authenticator;
GRANT flex_entity TO flex_authenticator;
GRANT flex_flexibility_information_system_operator TO flex_authenticator;
GRANT flex_market_operator TO flex_authenticator;
GRANT flex_organisation TO flex_authenticator;
GRANT flex_system_operator TO flex_authenticator;
GRANT flex_service_provider TO flex_authenticator;
GRANT flex_third_party TO flex_authenticator;
GRANT flex_internal_event_notification TO flex_authenticator;

-- flex user must be able to SET LOCAL ROLE to any party role (used by FlexTransaction)
GRANT flex_anonymous TO flex;
GRANT flex_balance_responsible_party TO flex;
GRANT flex_end_user TO flex;
GRANT flex_energy_supplier TO flex;
GRANT flex_entity TO flex;
GRANT flex_flexibility_information_system_operator TO flex;
GRANT flex_market_operator TO flex;
GRANT flex_organisation TO flex;
GRANT flex_system_operator TO flex;
GRANT flex_service_provider TO flex;
GRANT flex_third_party TO flex;
GRANT flex_internal TO flex;
GRANT flex_internal_event_notification TO flex;
GRANT flex_common TO flex;

-- anonymous and common role hierarchy
GRANT flex_anonymous TO
flex_balance_responsible_party,
flex_end_user,
flex_energy_supplier,
flex_entity,
flex_flexibility_information_system_operator,
flex_market_operator,
flex_organisation,
flex_system_operator,
flex_service_provider,
flex_third_party;

GRANT flex_common TO
flex_balance_responsible_party,
flex_end_user,
flex_energy_supplier,
flex_flexibility_information_system_operator,
flex_market_operator,
flex_organisation,
flex_system_operator,
flex_service_provider,
flex_third_party;
