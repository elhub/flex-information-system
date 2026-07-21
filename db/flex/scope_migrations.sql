--liquibase formatted sql
-- Manually managed file

-- changeset flex:validate-scope endDelimiter:; runOnChange:true
-- changing the constraint is done by creating a new domain first, then
-- replacing the old domain with it (cannot alter a domain used elsewhere)
CREATE DOMAIN flex.scope_tmp AS text
CONSTRAINT check_scope_regex
CHECK (value ~ '^((read)|(use)|(manage)):[a-z_]+(:[a-z_]+(:[a-z_]+)?)?$');

ALTER DOMAIN flex.scope_tmp
ADD CONSTRAINT check_scope CHECK (
    value IN (
        'read:data',
        'use:data',
        'use:data:entity:lookup',
        'manage:data',
        'manage:data:party_membership',
        'manage:data:entity_client',
        'read:auth',
        'use:auth',
        'manage:auth',
        'read:attachment',
        'use:attachment',
        'manage:attachment'
    )
);

-- drop dependent api views and their dependencies so ALTER COLUMN is possible
-- everything is recreated by the api changelogs

DROP FUNCTION IF EXISTS api.entity(api.entity_client);
DROP FUNCTION IF EXISTS api.client(api.entity);
DROP FUNCTION IF EXISTS api.party(api.entity_client);
DROP VIEW IF EXISTS api.entity_client;

DROP VIEW IF EXISTS api.party_membership_history;

DROP FUNCTION IF EXISTS api.party(api.party_membership);
DROP FUNCTION IF EXISTS api.entity(api.party_membership);
DROP FUNCTION IF EXISTS api.party_membership(api.entity);
DROP VIEW IF EXISTS api.party_membership;

ALTER TABLE flex.entity_client
ALTER COLUMN scopes TYPE flex.scope_tmp []
USING scopes::text::flex.scope_tmp [];

ALTER TABLE flex.entity_client_history
ALTER COLUMN scopes TYPE flex.scope_tmp []
USING scopes::text::flex.scope_tmp [];

ALTER TABLE flex.party_membership
ALTER COLUMN scopes TYPE flex.scope_tmp []
USING scopes::text::flex.scope_tmp [];

ALTER TABLE flex.party_membership_history
ALTER COLUMN scopes TYPE flex.scope_tmp []
USING scopes::text::flex.scope_tmp [];

DROP DOMAIN flex.scope;

ALTER DOMAIN flex.scope_tmp RENAME TO scope;
