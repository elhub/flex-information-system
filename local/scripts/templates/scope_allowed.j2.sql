--liquibase formatted sql
-- GENERATED CODE (scope-to-db) — do not edit manually

-- changeset flex:scope-allowed-function runOnChange:true endDelimiter:--
-- Single source of truth for the set of accepted scopes. Called from the
-- check_scope_allowed constraint on the flex.scope domain, so it is enforced
-- per element on every flex.scope[] column. Replacing this function (a plain
-- CREATE OR REPLACE, runOnChange) is the ONLY migration needed to change the
-- accepted scopes: no domain, table, view or grant is ever touched.
--
-- It is intentionally PL/pgSQL (not an inlinable SQL function): an inlined
-- IMMUTABLE SQL body gets cached in each backend's per-session domain-constraint
-- cache, so a CREATE OR REPLACE would not be picked up by already-open pooled
-- connections. A PL/pgSQL function is called through the function manager and
-- its plan is invalidated on replacement, so the new list takes effect at once.
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
