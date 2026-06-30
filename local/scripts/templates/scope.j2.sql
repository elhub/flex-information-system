--liquibase formatted sql
-- GENERATED CODE (scope-to-db) — do not edit manually

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
{%- for scope in scopes %}
        '{{ scope }}'{{ "," if not loop.last else "" }}
{%- endfor %}
    )
) NOT VALID;
