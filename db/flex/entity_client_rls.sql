--liquibase formatted sql
-- Manually managed file

-- changeset flex:user-is-human runOnChange:true endDelimiter:;
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

-- changeset flex:entity-client-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS entity_client ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT, UPDATE, DELETE ON entity_client TO flex_entity;

-- RLS: ECL-ENT001
DROP POLICY IF EXISTS "ECL_ENT001" ON entity_client;

CREATE POLICY "ECL_ENT001" ON entity_client
FOR SELECT
TO flex_entity
USING (
    entity_id = (SELECT flex.current_entity())
);

-- RLS: ECL-ENT002
DROP POLICY IF EXISTS "ECL_ENT002_INSERT" ON entity_client;
CREATE POLICY "ECL_ENT002_INSERT" ON entity_client
FOR INSERT
TO flex_entity
WITH CHECK (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_entity())
);

DROP POLICY IF EXISTS "ECL_ENT002_UPDATE" ON entity_client;
CREATE POLICY "ECL_ENT002_UPDATE" ON entity_client
FOR UPDATE
TO flex_entity
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_entity())
);
DROP POLICY IF EXISTS "ECL_ENT002_DELETE" ON entity_client;
CREATE POLICY "ECL_ENT002_DELETE" ON entity_client
FOR DELETE
TO flex_entity
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_entity())
);


-- RLS: ECL-FISO001
DROP POLICY IF EXISTS "ECL_FISO001" ON entity_client;
CREATE POLICY "ECL_FISO001" ON entity_client
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

GRANT INSERT, SELECT, UPDATE, DELETE ON entity_client TO flex_organisation;
-- RLS: ECL-ORG001
DROP POLICY IF EXISTS "ECL_ORG001" ON entity_client;
CREATE POLICY "ECL_ORG001" ON entity_client
FOR SELECT
TO flex_organisation
USING (
    entity_id = (SELECT flex.current_party_owner())
);
-- RLS: ECL-ORG002
DROP POLICY IF EXISTS "ECL_ORG002_INSERT" ON entity_client;
CREATE POLICY "ECL_ORG002_INSERT" ON entity_client
FOR INSERT
TO flex_organisation
WITH CHECK (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
DROP POLICY IF EXISTS "ECL_ORG002_UPDATE" ON entity_client;
CREATE POLICY "ECL_ORG002_UPDATE" ON entity_client
FOR UPDATE
TO flex_organisation
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
DROP POLICY IF EXISTS "ECL_ORG002_DELETE" ON entity_client;
CREATE POLICY "ECL_ORG002_DELETE" ON entity_client
FOR DELETE
TO flex_organisation
USING (
    (SELECT user_is_human())
    AND entity_id = (SELECT flex.current_party_owner())
);
