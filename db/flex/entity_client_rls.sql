--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS entity_client ENABLE ROW LEVEL SECURITY;

GRANT INSERT, SELECT, UPDATE, DELETE ON entity_client TO flex_entity;
-- RLS: ECL-ENT001
CREATE POLICY "ECL_ENT001" ON entity_client
FOR SELECT
TO flex_entity
USING (
    entity_id = (SELECT flex.current_entity())
    AND 'auth:read' IN (SELECT flex.current_scopes())
);
-- RLS: ECL-ENT002
CREATE POLICY "ECL_ENT002_INSERT" ON entity_client
FOR INSERT
TO flex_entity
WITH CHECK (
    entity_id = (SELECT flex.current_entity())
    AND 'auth:manage' IN (SELECT flex.current_scopes())
);
CREATE POLICY "ECL_ENT002_UPDATE" ON entity_client
FOR UPDATE
TO flex_entity
USING (
    entity_id = (SELECT flex.current_entity())
    AND 'auth:manage' IN (SELECT flex.current_scopes())
);
CREATE POLICY "ECL_ENT002_DELETE" ON entity_client
FOR DELETE
TO flex_entity
USING (
    entity_id = (SELECT flex.current_entity())
    AND 'auth:manage' IN (SELECT flex.current_scopes())
);

-- RLS: ECL-FISO001
CREATE POLICY "ECL_FISO001" ON entity_client
FOR SELECT
TO flex_flexibility_information_system_operator
USING ('auth:read' IN (SELECT flex.current_scopes()));
