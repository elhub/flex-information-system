--liquibase formatted sql
-- Manually managed file

-- changeset flex:identity-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS identity (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    eid uuid UNIQUE DEFAULT public.uuid_generate_v4(),
    entity_id bigint,
    party_id bigint NULL,
    CONSTRAINT fk_identity_party_id FOREIGN KEY (party_id)
    REFERENCES party (id),
    CONSTRAINT fk_identity_entity_id FOREIGN KEY (entity_id)
    REFERENCES entity (id),
    CONSTRAINT uk_identity_eid UNIQUE (eid),
    CONSTRAINT uk_identity_entity_id_party_id UNIQUE (entity_id, party_id)
);

-- changeset flex:identity-external-id runOnChange:true endDelimiter:--
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
