--liquibase formatted sql
-- Manually managed file

-- changeset flex:identity-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS identity ENABLE ROW LEVEL SECURITY;

-- RLS: ID-ENT001
GRANT SELECT ON identity TO flex_entity;
CREATE POLICY "ID_ENT001" ON identity
FOR SELECT
TO flex_entity
USING (
    true
    -- 'auth:read' IN (SELECT flex.current_scopes())
);

-- RLS: ID-COM001
GRANT SELECT ON identity TO flex_common;
CREATE POLICY "ID_COM001" ON identity
FOR SELECT
TO flex_common
USING ('auth:read' IN (SELECT flex.current_scopes()));
