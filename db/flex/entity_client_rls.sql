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
