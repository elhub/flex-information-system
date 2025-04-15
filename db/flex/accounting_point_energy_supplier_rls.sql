ALTER TABLE IF EXISTS accounting_point_energy_supplier
ENABLE ROW LEVEL SECURITY;

-- RLS: APES-COM001
GRANT SELECT ON accounting_point_energy_supplier
TO flex_common;
CREATE POLICY "APES_COM001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_common
USING (true);

-- RLS: APES-COM002
GRANT SELECT ON accounting_point_energy_supplier_history
TO flex_common;
CREATE POLICY "APES_COM002"
ON accounting_point_energy_supplier_history
FOR SELECT
TO flex_common
USING (true);
