-- NOTE: Init scripts only runs on first start of the container
-- It will NOT run on restarts
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- noqa: RF05
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS ltree;

-- flex is the main role for the application
CREATE ROLE flex WITH NOINHERIT LOGIN PASSWORD 'flex_password';
-- it owns all the schemas and objects in the database
-- it should be allowed to create new schemas
GRANT CREATE ON DATABASE flex TO flex;
-- also manage replication slots
ALTER USER flex WITH REPLICATION;
-- the main schema must exist for liquibase to add its changelog tables
CREATE SCHEMA flex AUTHORIZATION flex;

-- authenticator is used by backend/postgREST to connect to the database
CREATE ROLE flex_authenticator
WITH NOINHERIT LOGIN PASSWORD 'authenticator_password';

-- party roles
CREATE ROLE flex_anonymous WITH NOINHERIT NOLOGIN;
CREATE ROLE flex_balance_responsible_party WITH NOLOGIN;
CREATE ROLE flex_common WITH NOLOGIN;
CREATE ROLE flex_end_user WITH NOLOGIN;
CREATE ROLE flex_energy_supplier WITH NOLOGIN;
CREATE ROLE flex_entity WITH NOLOGIN;
CREATE ROLE flex_flexibility_information_system_operator WITH NOLOGIN;
CREATE ROLE flex_market_operator WITH NOLOGIN;
CREATE ROLE flex_service_provider WITH NOLOGIN;
CREATE ROLE flex_system_operator WITH NOLOGIN;
CREATE ROLE flex_third_party WITH NOLOGIN;

-- internal roles
CREATE ROLE flex_replication
WITH REPLICATION NOINHERIT LOGIN PASSWORD 'replication_password';

-- flex_internal is similar to flex_anonymous but is used for internal
-- system roles. All internal roles are granted to flex_internal
-- and inherit from it. This way, we can easily add new internal roles
-- without having to add them all-over-the-place.
CREATE ROLE flex_internal WITH NOINHERIT NOLOGIN;

-- flex_operation_readonly is used for read-only access to the production
-- database, for debug purposes, without risk of interfering with the data.
CREATE ROLE flex_operation_readonly WITH NOINHERIT NOLOGIN BYPASSRLS;

CREATE ROLE flex_internal_event_notification WITH NOLOGIN;
GRANT flex_internal TO flex_internal_event_notification;


-- authenticator will set role to any of the party and internal roles
GRANT flex_anonymous TO flex_authenticator;
GRANT flex_balance_responsible_party TO flex_authenticator;
GRANT flex_end_user TO flex_authenticator;
GRANT flex_energy_supplier TO flex_authenticator;
GRANT flex_entity TO flex_authenticator;
GRANT flex_flexibility_information_system_operator TO flex_authenticator;
GRANT flex_market_operator TO flex_authenticator;
GRANT flex_system_operator TO flex_authenticator;
GRANT flex_service_provider TO flex_authenticator;
GRANT flex_third_party TO flex_authenticator;

-- internal system roles
GRANT flex_internal_event_notification TO flex_authenticator;

-- common and anonymous inherits from common
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
