--liquibase formatted sql
-- Manually managed file

-- changeset flex:create-scope-domain endDelimiter:-- runOnChange:false
CREATE DOMAIN flex.scope AS text
CONSTRAINT check_scope_regex
CHECK (value ~ '^((read)|(use)|(manage)):[a-z_]+(:[a-z_]+(:[a-z_]+)?)?$');

-- changeset flex:scope-allowed-constraint runOnChange:true endDelimiter:;
-- drop the outdated constraint and add the new one based on the function
-- (that can be freely updated later without having to drop dependent objects)
-- NOT VALID skips the scan of existing rows (they already satisfy the list)
-- so that we do not have to drop dependent objects here either
ALTER DOMAIN flex.scope DROP CONSTRAINT IF EXISTS check_scope;
ALTER DOMAIN flex.scope DROP CONSTRAINT IF EXISTS check_scope_allowed;
ALTER DOMAIN flex.scope
ADD CONSTRAINT check_scope_allowed CHECK (flex.scope_allowed(value)) NOT VALID;
