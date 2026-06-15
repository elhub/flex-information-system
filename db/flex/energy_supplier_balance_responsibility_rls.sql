--liquibase formatted sql
-- Manually managed file

-- changeset flex:energy-supplier-balance-responsibility-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS energy_supplier_balance_responsibility
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON energy_supplier_balance_responsibility
TO flex_common;
DROP POLICY IF EXISTS "ESBR_INTERNAL_COMMON" ON energy_supplier_balance_responsibility;
CREATE POLICY "ESBR_INTERNAL_COMMON"
ON energy_supplier_balance_responsibility
FOR SELECT
TO flex_common
USING (true);
