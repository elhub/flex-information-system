ALTER TABLE IF EXISTS energy_supplier_balance_responsibility
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON energy_supplier_balance_responsibility
TO flex_common;
CREATE POLICY "ESBR_INTERNAL_COMMON"
ON energy_supplier_balance_responsibility
FOR SELECT
TO flex_common
USING (true);
