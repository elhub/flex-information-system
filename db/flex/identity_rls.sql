ALTER TABLE IF EXISTS identity ENABLE ROW LEVEL SECURITY;

CREATE POLICY identity_api ON identity
FOR SELECT
TO api
USING (true);

-- RLS: ID-ENT001
GRANT SELECT ON identity TO flex_entity;
CREATE POLICY "ID_ENT001" ON identity
FOR SELECT
TO flex_entity
USING (true);

-- RLS: ID-COM001
GRANT SELECT ON identity TO flex_common;
CREATE POLICY "ID_COM001" ON identity
FOR SELECT
TO flex_common
USING (true);

-- For "security definer" functions
GRANT SELECT ON identity TO auth;
CREATE POLICY identity_auth ON identity
FOR SELECT
TO auth
USING (true);
