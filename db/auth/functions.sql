-- liquibase formatted sql

-- changeset flex:auth-entity-of-credentials runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.entity_of_credentials(
    _client_id text, _client_secret text
)
RETURNS TABLE (
    entity_id bigint,
    external_id uuid
)
SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null) AS external_id
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
        flex.identity_external_id(e.id, null) as external_id
    FROM flex.entity e
    WHERE e.business_id = in_business_id
$$;

-- changeset flex:auth-entity-client-by-uuid runAlways:true endDelimiter:--
-- Gets entity details from the entity client uuid
CREATE OR REPLACE FUNCTION auth.entity_client_by_uuid(in_client_id text)
RETURNS TABLE (
    entity_id bigint,
    external_id uuid,
    client_public_key text
) SECURITY DEFINER VOLATILE
LANGUAGE sql
AS $$
    SELECT
        e.id,
        flex.identity_external_id(e.id, null) as external_id,
        COALESCE(clt.public_key,'') as client_public_key
    FROM flex.entity e
    INNER JOIN flex.entity_client as clt
        ON e.id = clt.entity_id
    WHERE clt.client_id::text = in_client_id
$$;

-- changeset flex:auth-assume-party runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.assume_party(_party_id bigint)
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
    WHERE i.id = flex.current_identity();
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
