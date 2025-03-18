ALTER TABLE IF EXISTS client ENABLE ROW LEVEL SECURITY;

-- RLS: CLI-ENT001
GRANT INSERT, SELECT, UPDATE, DELETE ON client TO flex_entity;
CREATE POLICY "CLI_ENT001" ON client
FOR ALL
TO flex_entity
USING (
    entity_id = flex.current_entity()
);

-- RLS: CLI-FISO001
CREATE POLICY "CLI_FISO001" ON client
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
