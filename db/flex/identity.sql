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
