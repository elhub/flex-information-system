--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client-party-scopes runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'entity_client' AND column_name = 'scopes'
ALTER TABLE flex.entity_client
DISABLE TRIGGER USER;

-- add scopes
ALTER TABLE flex.entity_client
ADD COLUMN scopes flex.scope [];

UPDATE flex.entity_client
SET scopes = '{manage:data, manage:auth}'
WHERE scopes IS null OR array_length(scopes, 1) = 0;

ALTER TABLE flex.entity_client
ALTER COLUMN scopes SET NOT NULL;

ALTER TABLE flex.entity_client
ADD CONSTRAINT check_scopes_not_empty CHECK (
    array_length(scopes, 1) > 0
);

ALTER TABLE flex.entity_client_history
ADD COLUMN scopes flex.scope [];

UPDATE flex.entity_client_history
SET scopes = '{manage:data, manage:auth}';

-- add party
ALTER TABLE flex.entity_client
ADD COLUMN party_id bigint;

ALTER TABLE flex.entity_client_history
ADD COLUMN party_id bigint;

ALTER TABLE flex.entity_client
ENABLE TRIGGER USER;
