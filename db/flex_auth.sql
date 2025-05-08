-- authn
SET search_path TO flex, public;

-- Functions related figuring out the current user
\i flex/current_user_setting.sql

-- must be loaded before the resources below
\i flex/event.sql

-- must be loaded before identity
\i flex/entity.sql
\i flex/party.sql

-- must be loaded before identity_external_id below
\i flex/identity.sql
