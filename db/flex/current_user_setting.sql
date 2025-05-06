--liquibase formatted sql
-- These functions are used to tell the database who the current user is.
-- They are used by access policies, audit and history functionality.
-- They must be defined really early since a lot of other object depends on them.

-- changeset flex:current-identity runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.current_identity() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_identity', true),'')::bigint;
$$;

-- changeset flex:current-party runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.current_party() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_party', true),'')::bigint;
$$;

-- changeset flex:current-entity runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.current_entity() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_entity', true),'')::bigint;
$$;

-- changeset flex:set-entity-party-identity runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.set_entity_party_identity(
    p_entity_id bigint,
    p_party_id bigint,
    p_identity_id bigint
) RETURNS void
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT
        set_config('flex.current_entity', p_entity_id::text, true),
        set_config('flex.current_party', p_party_id::text, true),
        set_config('flex.current_identity', p_identity_id::text, true);
$$;
