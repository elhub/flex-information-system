--liquibase formatted sql
-- GENERATED CODE (scope-to-db) — do not edit manually

-- changeset flex:scope-allowed-function runOnChange:true endDelimiter:--
-- single generated source of truth for the set of accepted scopes
-- (changing scopes causes only this migration to be run again)
CREATE OR REPLACE FUNCTION flex.scope_allowed(scope text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN scope IN (
{%- for s in scopes %}
        '{{ s }}'{{ "," if not loop.last else "" }}
{%- endfor %}
    );
END;
$$;
