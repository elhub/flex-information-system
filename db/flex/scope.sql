--liquibase formatted sql
-- Manually managed file

-- changeset flex:create-scope-domain endDelimiter:-- runOnChange:false
CREATE DOMAIN flex.scope AS text
CONSTRAINT check_scope_regex
CHECK (value ~ '^((read)|(use)|(manage)):[a-z_]+(:[a-z_]+(:[a-z_]+)?)?$');

-- changeset flex:validate-scope endDelimiter:; runOnChange:true
ALTER DOMAIN flex.scope
DROP CONSTRAINT IF EXISTS check_scope;
ALTER DOMAIN flex.scope
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
        'manage:auth'
    )
);
