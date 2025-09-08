-- liquibase formatted sql

-- changeset flex:auth-entity-of-credentials runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.entity_of_credentials(
    _client_id text, _client_secret text
)
RETURNS TABLE (
    entity_id bigint,
    external_id uuid,
    scopes text []
)
SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null, clt.id) AS external_id,
        clt.scopes as scopes
    FROM flex.entity e
    INNER JOIN flex.entity_client AS clt
        ON e.id = clt.entity_id
    WHERE clt.client_id::text = _client_id
        AND clt.client_secret = public.crypt(_client_secret, clt.client_secret)
$$;

-- changeset flex:auth-entity-of-credentials-execute runAlways:true endDelimiter:--
GRANT EXECUTE ON FUNCTION auth.entity_of_credentials TO flex_anonymous;

-- changeset flex:auth-entity-of-business-id runAlways:true endDelimiter:--
-- Gets entity details from the business id
CREATE OR REPLACE FUNCTION auth.entity_of_business_id(
    in_business_id text,
    in_business_id_type text
) RETURNS TABLE (
    entity_id bigint,
    external_id uuid
) SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null, null) as external_id
    FROM flex.entity e
    WHERE e.business_id = in_business_id
$$;

-- changeset flex:auth-entity-client-by-uuid runAlways:true endDelimiter:--
-- Gets entity details from the entity client uuid
CREATE OR REPLACE FUNCTION auth.entity_client_by_uuid(in_client_id text)
RETURNS TABLE (
    entity_id bigint,
    external_id uuid,
    client_public_key text,
    scopes text []
) SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null, clt.id) as external_id,
        COALESCE(clt.public_key,'') as client_public_key,
        clt.scopes as scopes
    FROM flex.entity e
    INNER JOIN flex.entity_client as clt
        ON e.id = clt.entity_id
    WHERE clt.client_id::text = in_client_id
$$;

-- changeset flex:auth-refresh-identity-drop-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.refresh_identity_drop_party(
    in_external_id text
) RETURNS TABLE (
    external_id uuid,
    scopes text []
) SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        flex.identity_external_id(i.entity_id, null, clt.id) as external_id,
        clt.scopes as scopes
    FROM flex.identity i
        LEFT JOIN flex.entity_client as clt
            ON i.client_id = clt.id
    WHERE i.eid::text = in_external_id
$$;

-- changeset flex:auth-assume-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.assume_party(in_party_id bigint)
RETURNS TABLE (
    entity_id bigint,
    eid uuid,
    role text,
    scopes text []
)
SECURITY DEFINER VOLATILE
LANGUAGE plpgsql
AS $$
declare
  l_party_membership record;
  l_entity_id bigint;
  l_client_id bigint;
  l_eid uuid;
  l_role text;
  l_scopes text[];
begin
  select flex.current_entity() into l_entity_id;

  select clt.id into l_client_id
  from flex.identity as i
    left join flex.entity_client as clt on i.client_id = clt.id
  where i.id = (select flex.current_identity());

  select * into l_party_membership
  from flex.party_membership as pm
  where pm.entity_id = l_entity_id and pm.party_id = in_party_id;

  if l_party_membership is not null then
    -- entity is member of party
    select flex.identity_external_id(l_entity_id, in_party_id, l_client_id)
    into l_eid;
    select p.role into l_role from flex.party as p where p.id = in_party_id;
    select l_party_membership.scopes into l_scopes;
  elsif exists (
    select 1 from flex.party as p
    where p.id = in_party_id and p.entity_id = l_entity_id
  ) then
    -- entity owns party
    select flex.identity_external_id(l_entity_id, in_party_id, l_client_id)
    into l_eid;
    select p.role into l_role from flex.party as p where p.id = in_party_id;
    select array['manage:data', 'manage:auth']::text[] into l_scopes;
  else
    select null into l_eid;
    select null into l_role;
    select '{}'::text[] into l_scopes;
  end if;

  return query select
    l_entity_id as entity_id,
    l_eid as eid,
    l_role as role,
    l_scopes as scopes;
end;
$$;

-- changeset flex:auth-assume-party-execute runAlways:true endDelimiter:--
GRANT EXECUTE ON FUNCTION auth.assume_party TO flex_entity;

-- changeset flex:auth-party-of-identity runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.party_of_identity(_identity bigint)
RETURNS bigint
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT party_id FROM flex.identity WHERE id = _identity;
$$;

-- changeset flex:auth-party-of-identity-execute runAlways:true endDelimiter:--
GRANT EXECUTE ON FUNCTION auth.party_of_identity
TO flex_internal_event_notification;

-- changeset flex:auth-eid-details runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.eid_details(_eid text)
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

-- changeset flex:auth-eid-details-execute runAlways:true endDelimiter:;
GRANT EXECUTE ON FUNCTION auth.eid_details TO flex_entity;
GRANT EXECUTE ON FUNCTION auth.eid_details TO flex_common;

-- changeset flex:auth-current-user-info runAlways:true endDelimiter:--
-- This trigger functions is used to ensure that the
-- role name exists in the database catalog tables
CREATE OR REPLACE FUNCTION auth.current_user_info()
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
    WHERE i.id = (SELECT flex.current_identity());
$$;

-- changeset flex:auth-current-user-info-execute runAlways:true endDelimiter:;
GRANT EXECUTE ON FUNCTION auth.current_user_info TO flex_entity;
GRANT EXECUTE ON FUNCTION auth.current_user_info TO flex_common;

-- changeset flex:pre-request runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION
auth.pre_request() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER STABLE
AS $$
DECLARE
    _eid text = current_setting('request.jwt.claims', true)::json->>'eid';
BEGIN

    if _eid is null or _eid = '' then
        return;
    end if;

    perform
        flex.set_entity_party_identity(entity_id, party_id, id)
    from flex.identity
    where identity.eid = _eid::uuid;

    return;
END;
$$;

-- changeset flex:pre-request-execute runAlways:true endDelimiter:;
GRANT EXECUTE ON FUNCTION auth.pre_request TO flex_anonymous;
