--liquibase formatted sql
-- Manually managed file

-- changeset flex:identity-client-id runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'identity' AND column_name = 'client_id'
ALTER TABLE flex.identity
ADD COLUMN client_id bigint;

ALTER TABLE flex.identity
DROP CONSTRAINT uk_identity_entity_id_party_id;

ALTER TABLE flex.identity
ADD CONSTRAINT uk_identity_entity_id_party_id_client_id
UNIQUE (entity_id, party_id, client_id);
