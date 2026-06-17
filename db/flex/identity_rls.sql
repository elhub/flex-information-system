--liquibase formatted sql
-- Manually managed file

-- changeset flex:identity-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS identity ENABLE ROW LEVEL SECURITY;

-- RLS: ID-ENT001
GRANT SELECT ON identity TO flex_entity;
DROP POLICY IF EXISTS "ID_ENT001" ON identity;
CREATE POLICY "ID_ENT001" ON identity
FOR SELECT
TO flex_entity
USING (true);

-- RLS: ID-COM001
GRANT SELECT ON identity TO flex_common;
DROP POLICY IF EXISTS "ID_COM001" ON identity;
CREATE POLICY "ID_COM001" ON identity
FOR SELECT
TO flex_common
USING (true);
