--liquibase formatted sql
-- Manually managed file

-- changeset flex:energy-supplier-balance-responsibility-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS energy_supplier_balance_responsibility
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON energy_supplier_balance_responsibility
TO flex_common;
CREATE POLICY "ESBR_INTERNAL_COMMON"
ON energy_supplier_balance_responsibility
FOR SELECT
TO flex_common
USING ('data:read' IN (SELECT flex.current_scopes()));
