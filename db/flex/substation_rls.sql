--liquibase formatted sql
-- Manually managed file

-- changeset flex:substation-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS substation ENABLE ROW LEVEL SECURITY;

-- RLS: SS-FISO001
GRANT SELECT ON substation TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "SS_FISO001" ON substation;
CREATE POLICY "SS_FISO001" ON substation
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SS-SO001
GRANT SELECT ON substation TO flex_system_operator;
DROP POLICY IF EXISTS "SS_SO001" ON substation;
CREATE POLICY "SS_SO001" ON substation
FOR SELECT
TO flex_system_operator
USING (true);
