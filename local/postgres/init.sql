-- NOTE: Init scripts only runs on first start of the container
-- It will NOT run on restarts

-- flex is the main role for the application
-- it owns all the schemas and objects in the database
CREATE ROLE flex WITH NOINHERIT LOGIN PASSWORD NULL;

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
WITH NOINHERIT LOGIN PASSWORD 'replication_password';
CREATE ROLE flex_internal_event_notification WITH NOINHERIT NOLOGIN;


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
