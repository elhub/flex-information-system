ALTER TABLE IF EXISTS entity ENABLE ROW LEVEL SECURITY;

-- RLS: ENT-COM001
-- RLS: ENT-ENT001
GRANT SELECT ON entity TO flex_common;
CREATE POLICY "ENT_COM001_ENT001" ON entity
FOR SELECT
TO flex_common
USING (type = 'organisation' OR id = flex.current_entity());

GRANT SELECT, UPDATE ON entity TO flex_entity;
CREATE POLICY "ENT_ENT001" ON entity
FOR ALL
TO flex_entity
USING (id = flex.current_entity());

-- RLS: ENT-COM002
CREATE POLICY "ENT_COM002" ON entity
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party_membership pm -- noqa
    WHERE pm.entity_id = entity.id AND pm.party_id = flex.current_party() -- noqa
));

-- RLS: ENT-FISO001
CREATE POLICY "ENT_FISO001" ON entity
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- For "security definer" functions
GRANT SELECT ON entity TO auth;
CREATE POLICY entity_auth ON entity
FOR SELECT
TO auth
USING (true);
