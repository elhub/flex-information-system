--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client-attachment-scope runOnChange:false endDelimiter:;
ALTER TABLE flex.entity_client
DISABLE TRIGGER USER;

UPDATE flex.entity_client
SET scopes = array_append(scopes, 'manage:attachment'::flex.scope)
WHERE scopes @> '{manage:data}' AND NOT (scopes @> '{manage:attachment}');

UPDATE flex.entity_client
SET scopes = array_append(scopes, 'use:attachment'::flex.scope)
WHERE
    scopes @> '{use:data}'
    AND NOT (scopes @> '{use:attachment}')
    AND NOT (scopes @> '{manage:attachment}');

UPDATE flex.entity_client
SET scopes = array_append(scopes, 'read:attachment'::flex.scope)
WHERE
    scopes @> '{read:data}'
    AND NOT (scopes @> '{read:attachment}')
    AND NOT (scopes @> '{use:attachment}')
    AND NOT (scopes @> '{manage:attachment}');

UPDATE flex.entity_client_history
SET scopes = array_append(scopes, 'manage:attachment'::flex.scope)
WHERE scopes @> '{manage:data}' AND NOT (scopes @> '{manage:attachment}');

UPDATE flex.entity_client_history
SET scopes = array_append(scopes, 'use:attachment'::flex.scope)
WHERE
    scopes @> '{use:data}'
    AND NOT (scopes @> '{use:attachment}')
    AND NOT (scopes @> '{manage:attachment}');

UPDATE flex.entity_client_history
SET scopes = array_append(scopes, 'read:attachment'::flex.scope)
WHERE
    scopes IS NOT null
    AND scopes @> '{read:data}'
    AND NOT (scopes @> '{read:attachment}')
    AND NOT (scopes @> '{use:attachment}')
    AND NOT (scopes @> '{manage:attachment}');

ALTER TABLE flex.entity_client
ENABLE TRIGGER USER;

-- changeset flex:entity-client-check-assumable-party-function runOnChange:true endDelimiter:--
-- trigger to restrict the party field (can only be added once the field is there)
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
