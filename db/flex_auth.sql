-- authn
SET search_path TO flex, public;

-- grants for application roles
GRANT USAGE ON SCHEMA flex TO flex_anonymous;
GRANT USAGE ON SCHEMA flex TO flex_common;
GRANT USAGE ON SCHEMA flex TO flex_balance_responsible_party;
GRANT USAGE ON SCHEMA flex TO flex_end_user;
GRANT USAGE ON SCHEMA flex TO flex_energy_supplier;
GRANT USAGE ON SCHEMA flex TO flex_entity;
GRANT USAGE ON SCHEMA flex TO flex_flexibility_information_system_operator;
GRANT USAGE ON SCHEMA flex TO flex_market_operator;
GRANT USAGE ON SCHEMA flex TO flex_system_operator;
GRANT USAGE ON SCHEMA flex TO flex_service_provider;
GRANT USAGE ON SCHEMA flex TO flex_third_party;
GRANT USAGE ON SCHEMA flex TO flex_internal_event_notification;


-- This trigger functions is used to ensure that the
-- role name exists in the database catalog tables
CREATE OR REPLACE FUNCTION
check_role_exists() RETURNS trigger AS $$
begin
  if not exists (select 1 from pg_roles as r where r.rolname = new.role) then
    raise foreign_key_violation using message =
      'unknown database role: ' || new.role;
    return null;
  end if;
  return new;
end
$$ LANGUAGE plpgsql;

-- Audit functions
CREATE OR REPLACE FUNCTION
current_identity() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_identity', true),'')::bigint;
$$;

CREATE OR REPLACE FUNCTION
current_party() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_party', true),'')::bigint;
$$;

CREATE OR REPLACE FUNCTION
current_entity() RETURNS bigint
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
    SELECT nullif(current_setting('flex.current_entity', true),'')::bigint;
$$;

CREATE OR REPLACE FUNCTION recorded_by()
RETURNS trigger AS $$
BEGIN
  -- the system must be able to override on system-generated records
  -- 0 means system generated
  IF NOT ( TG_OP = 'INSERT' AND NEW.recorded_by = 0 ) THEN
    NEW.recorded_by = flex.current_identity();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION replaced_by()
RETURNS trigger AS $$
BEGIN
  NEW.replaced_by = flex.current_identity();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- all the following resources must be loaded after the audit functions above

-- must be loaded before the resources below
\i flex/event.sql

-- must be loaded before identity
\i flex/entity.sql
\i flex/party.sql

-- must be loaded before identity_external_id below
\i flex/identity.sql

CREATE OR REPLACE FUNCTION
identity_external_id(p_entity_id bigint, p_party_id bigint) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER VOLATILE
AS $$
declare
  lv_eid uuid;
begin

    select
      eid into lv_eid
    from flex.identity i
    where i.entity_id is not distinct from p_entity_id
    and i.party_id is not distinct from p_party_id;

    -- identity does not yet exists, so we need to create it
    if lv_eid is null then
      insert into flex.identity (entity_id, party_id)
      values (p_entity_id, p_party_id)
      returning eid into lv_eid;
    end if;

    return lv_eid;

end;
$$;

-- pre_request is used to set per-transaction configuration in the "flex" namespace.
-- These configs are used later on in audit and row level security.
-- https://postgrest.org/en/v12/references/transactions.html#pre-request
CREATE OR REPLACE FUNCTION
pre_request() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
    _eid text = current_setting('request.jwt.claims', true)::json->>'eid';
BEGIN

    if _eid is null or _eid = '' then
        return;
    end if;

    perform
        set_config('flex.current_entity', entity_id::text, true),
        set_config('flex.current_party', party_id::text, true),
        set_config('flex.current_identity', id::text, true)
    from flex.identity
    where identity.eid = _eid::uuid;

    return;
END;
$$;
