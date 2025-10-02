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

-- trigger to restrict the party field (can only be added once the field is there)

-- changeset flex:entity-client-check-assumable-party-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION entity_client_check_assumable_party()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT (
        -- entity is member of party
        EXISTS (
            SELECT 1 FROM flex.party_membership AS pm
            WHERE pm.entity_id = NEW.entity_id AND pm.party_id = NEW.party_id
        )
        -- entity owns party
        OR EXISTS (
            SELECT 1 FROM flex.party AS p
            WHERE p.id = NEW.party_id AND p.entity_id = NEW.entity_id
        )
    ) THEN
        RAISE EXCEPTION 'entity cannot assume the chosen party';
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:entity-client-check-assumable-party-trigger runOnChange:true endDelimiter:--
-- ECL-VAL001
CREATE OR REPLACE TRIGGER entity_client_check_assumable_party
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW
WHEN (new.party_id IS NOT null)
EXECUTE FUNCTION entity_client_check_assumable_party();
