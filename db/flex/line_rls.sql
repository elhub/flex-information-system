--liquibase formatted sql
-- Manually managed file

-- changeset flex:line-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS line ENABLE ROW LEVEL SECURITY;

-- RLS: LN-FISO001
GRANT SELECT ON line TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "LN_FISO001" ON line;
CREATE POLICY "LN_FISO001" ON line
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: LN-SO001
GRANT SELECT ON line TO flex_system_operator;
DROP POLICY IF EXISTS "LN_SO001" ON line;
CREATE POLICY "LN_SO001" ON line
FOR SELECT
TO flex_system_operator
USING (true);
