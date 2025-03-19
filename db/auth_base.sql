-- The auth schema is for the auth module
SET search_path TO auth;

-- grants for application roles
GRANT USAGE ON SCHEMA auth TO flex_anonymous;
GRANT USAGE ON SCHEMA auth TO flex_common;
GRANT USAGE ON SCHEMA auth TO flex_balance_responsible_party;
GRANT USAGE ON SCHEMA auth TO flex_end_user;
GRANT USAGE ON SCHEMA auth TO flex_energy_supplier;
GRANT USAGE ON SCHEMA auth TO flex_entity;
GRANT USAGE ON SCHEMA auth TO flex_flexibility_information_system_operator;
GRANT USAGE ON SCHEMA auth TO flex_market_operator;
GRANT USAGE ON SCHEMA auth TO flex_system_operator;
GRANT USAGE ON SCHEMA auth TO flex_service_provider;
GRANT USAGE ON SCHEMA auth TO flex_third_party;
GRANT USAGE ON SCHEMA auth TO flex_internal_event_notification;

CREATE OR REPLACE FUNCTION entity_of_credentials(
    _client_id text, _client_secret text
)
RETURNS TABLE (
    entity_id bigint,
    external_id uuid
)
SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    select
      e.id,
      flex.identity_external_id(e.id, null) as external_id
    from
      flex.entity e
    inner join flex.entity_client as clt
      on e.id = clt.entity_id
    where
      clt.client_id = _client_id::uuid
      and clt.client_secret = public.crypt(_client_secret, clt.client_secret)
$$;

GRANT EXECUTE ON FUNCTION entity_of_credentials TO flex_anonymous;

-- Gets entity details from the business id
CREATE OR REPLACE FUNCTION entity_of_business_id(
    in_business_id text,
    in_business_id_type text
) RETURNS TABLE (
    entity_id bigint,
    external_id uuid,
    client_public_key text
) SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null) as external_id,
        COALESCE(e.client_public_key,'') as client_public_key
    FROM
        flex.entity e
    WHERE
        e.business_id = in_business_id
        AND e.business_id_type = in_business_id_type
$$;

CREATE OR REPLACE FUNCTION assume_party(_party_id bigint)
RETURNS TABLE (
    entity_id bigint,
    eid uuid,
    role text
)
SECURITY DEFINER VOLATILE
LANGUAGE plpgsql
AS $$
declare
  _entity_id bigint;
  eid uuid;
  role text;
begin
  select flex.current_entity() into _entity_id;

  if exists (
    select 1 from flex.party_membership pm
    where pm.entity_id = _entity_id and pm.party_id = _party_id
  ) then
    select flex.identity_external_id(_entity_id, _party_id) into eid;
  else
    select null into eid;
  end if;

  if eid is not null then
    select p.role into role from flex.party p where p.id = _party_id;
  else
    select null into role;
  end if;

  return query select _entity_id as entity_id, eid, role;
end;
$$;

GRANT EXECUTE ON FUNCTION assume_party TO flex_entity;

CREATE OR REPLACE FUNCTION party_of_identity(_identity bigint)
RETURNS bigint
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT party_id FROM flex.identity WHERE id = _identity;
$$;

GRANT EXECUTE ON FUNCTION party_of_identity TO flex_internal_event_notification;

CREATE OR REPLACE FUNCTION eid_details(_eid text)
RETURNS TABLE (
    id bigint,
    entity_id bigint,
    party_id bigint,
    role text
)
SECURITY DEFINER STABLE
LANGUAGE sql
AS $$
    select
      i.id,
      i.entity_id,
      i.party_id,
      coalesce(p.role, 'flex_entity')
    from flex.identity i
    left join flex.party p on i.party_id = p.id
    where i.eid = _eid::uuid;
$$;

GRANT EXECUTE ON FUNCTION eid_details TO flex_entity;
GRANT EXECUTE ON FUNCTION eid_details TO flex_common;

-- This trigger functions is used to ensure that the
-- role name exists in the database catalog tables
CREATE OR REPLACE FUNCTION current_user_info()
RETURNS TABLE (
    identity_id int,
    external_id uuid,
    entity_id int,
    entity_name text,
    party_id int,
    party_name text
)
SECURITY INVOKER
LANGUAGE sql AS
$$
    SELECT
        i.id as identity_id,
        i.eid as external_id,
        e.id as entity_id,
        e.name as entity_name,
        p.id as party_id,
        p.name as party_name
    FROM flex.identity i
    INNER JOIN flex.entity e ON i.entity_id = e.id
    LEFT JOIN flex.party p ON i.party_id = p.id
    WHERE i.id = flex.current_identity();
$$;

GRANT EXECUTE ON FUNCTION current_user_info TO flex_entity;
GRANT EXECUTE ON FUNCTION current_user_info TO flex_common;
