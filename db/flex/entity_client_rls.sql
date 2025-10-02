--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS entity_client ENABLE ROW LEVEL SECURITY;

-- RLS: ECL-ENT001
GRANT INSERT, SELECT, UPDATE, DELETE ON entity_client TO flex_entity;
CREATE POLICY "ECL_ENT001" ON entity_client
FOR ALL
TO flex_entity
USING (
    entity_id = (SELECT flex.current_entity())
);

-- RLS: ECL-FISO001
CREATE POLICY "ECL_FISO001" ON entity_client
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- checks the user is not a machine (entity client login / organisation entity)
CREATE OR REPLACE FUNCTION user_is_human()
RETURNS boolean
SECURITY INVOKER
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM flex.identity AS i
            INNER JOIN flex.entity AS e ON i.entity_id = e.id
        WHERE i.id = (SELECT flex.current_identity())
            AND e.type = 'person'
            AND i.client_id IS null
    )
$$;

GRANT INSERT, SELECT, UPDATE, DELETE ON entity_client TO flex_organisation;
-- RLS: ECL-ORG001
CREATE POLICY "ECL_ORG001" ON entity_client
FOR SELECT
TO flex_organisation
USING (
    entity_id = (SELECT flex.current_party_owner())
);
-- RLS: ECL-ORG002
CREATE POLICY "ECL_ORG002_INSERT" ON entity_client
FOR INSERT
TO flex_organisation
WITH CHECK (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
CREATE POLICY "ECL_ORG002_UPDATE" ON entity_client
FOR UPDATE
TO flex_organisation
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
CREATE POLICY "ECL_ORG002_DELETE" ON entity_client
FOR DELETE
TO flex_organisation
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
