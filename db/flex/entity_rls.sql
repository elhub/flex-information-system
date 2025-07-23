--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS entity ENABLE ROW LEVEL SECURITY;

-- RLS: ENT-COM001
-- RLS: ENT-ENT001
GRANT SELECT ON entity TO flex_common;
CREATE POLICY "ENT_COM001_ENT001" ON entity
FOR SELECT
TO flex_common
USING (type = 'organisation' OR id = (SELECT flex.current_entity()));

GRANT SELECT ON entity TO flex_entity;
CREATE POLICY "ENT_ENT001" ON entity
FOR SELECT
TO flex_entity
USING (id = (SELECT flex.current_entity()));

-- RLS: ENT-COM002
-- RLS: ENT-COM003
CREATE POLICY "ENT_COM002_COM003" ON entity
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party_membership AS pm
    WHERE pm.entity_id = entity.id AND pm.party_id = (SELECT flex.current_party()) -- noqa
    UNION ALL
    SELECT 1
    FROM party AS p
    WHERE p.id = (SELECT flex.current_party()) AND p.entity_id = entity.id -- noqa
));

GRANT SELECT, INSERT ON entity TO flex_flexibility_information_system_operator;
-- RLS: ENT-FISO001
CREATE POLICY "ENT_FISO001" ON entity
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
-- RLS: ENT-FISO002
CREATE POLICY "ENT_FISO002_INSERT" ON entity
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK (true);
CREATE POLICY "ENT_FISO002_UPDATE" ON entity
FOR UPDATE
TO flex_flexibility_information_system_operator
USING (true);
