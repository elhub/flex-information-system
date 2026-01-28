--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS notice ENABLE ROW LEVEL SECURITY;

-- RLS: NOTICE-COM001
GRANT SELECT, UPDATE ON notice TO flex_common;
CREATE POLICY "NOTICE_COM001" ON notice
FOR ALL
TO flex_common
USING (party_id = (SELECT flex.current_party()));

-- RLS: NOTICE-FISO001
CREATE POLICY "NOTICE_FISO001" ON notice
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
