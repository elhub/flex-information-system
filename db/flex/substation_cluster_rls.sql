--liquibase formatted sql
-- Manually managed file

-- changeset flex:substation-cluster-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS substation_cluster ENABLE ROW LEVEL SECURITY;

-- RLS: SSC-FISO001
GRANT SELECT ON substation_cluster TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "SSC_FISO001" ON substation_cluster;
CREATE POLICY "SSC_FISO001" ON substation_cluster
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SSC-SO001
GRANT SELECT ON substation_cluster TO flex_system_operator;
DROP POLICY IF EXISTS "SSC_SO001" ON substation_cluster;
CREATE POLICY "SSC_SO001" ON substation_cluster
FOR SELECT
TO flex_system_operator
USING (true);
