--liquibase formatted sql
-- Manually managed file

-- changeset flex:identity-create runOnChange:false endDelimiter:--
-- validCheckSum: 9:f376fb08b470f2146fde7a05e9d81da1
CREATE TABLE IF NOT EXISTS identity (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    eid uuid UNIQUE DEFAULT public.uuid_generate_v4(),
    entity_id bigint,
    party_id bigint NULL,
    client_id bigint NULL,
    CONSTRAINT fk_identity_party_id FOREIGN KEY (party_id)
    REFERENCES party (id),
    CONSTRAINT fk_identity_entity_id FOREIGN KEY (entity_id)
    REFERENCES entity (id),
    CONSTRAINT uk_identity_eid UNIQUE (eid),
    CONSTRAINT uk_identity_entity_id_party_id_client_id
    UNIQUE (entity_id, party_id, client_id)
);

-- changeset flex:identity-client-id-reference-check runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION identity_client_id_reference_check()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW.client_id IS NOT null AND NOT EXISTS (
        SELECT 1 FROM flex.entity_client clt WHERE clt.id = NEW.client_id
    ) THEN
        RAISE EXCEPTION 'Non-null client_id should point to an existing entity client';
    END IF;

    RETURN NEW;
END
$$;

-- changeset flex:identity-client-id-reference-check-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER identity_client_id_reference_check
BEFORE INSERT ON identity
FOR EACH ROW
EXECUTE FUNCTION identity_client_id_reference_check();

-- changeset flex:identity-external-id runOnChange:true endDelimiter:--
DROP FUNCTION IF EXISTS identity_external_id(bigint, bigint);
CREATE OR REPLACE FUNCTION
identity_external_id(p_entity_id bigint, p_party_id bigint, p_client_id bigint)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER VOLATILE
AS $$
declare
  lv_eid uuid;
begin

    select
      eid into lv_eid
    from flex.identity i
    where i.entity_id is not distinct from p_entity_id
    and i.party_id is not distinct from p_party_id
    and i.client_id is not distinct from p_client_id;

    -- identity does not yet exists, so we need to create it
    if lv_eid is null then
      insert into flex.identity (entity_id, party_id, client_id)
      values (p_entity_id, p_party_id, p_client_id)
      returning eid into lv_eid;
    end if;

    return lv_eid;

end;
$$;
