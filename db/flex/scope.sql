--liquibase formatted sql
-- Manually managed file

-- changeset flex:create-scope-domain endDelimiter:-- runOnChange:false
CREATE DOMAIN flex.scope AS text
CONSTRAINT check_scope_regex
CHECK (value ~ '^((read)|(use)|(manage)):[a-z_]+(:[a-z_]+(:[a-z_]+)?)?$');
