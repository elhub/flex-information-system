ALTER TABLE IF EXISTS accounting_point ENABLE ROW LEVEL SECURITY;

-- RLS: AP-COM001
GRANT SELECT ON accounting_point
TO flex_common;
CREATE POLICY "AP_COM001"
ON accounting_point
FOR SELECT
TO flex_common
USING (true);

-- RLS: AP-COM002
GRANT SELECT ON accounting_point_history
TO flex_common;
CREATE POLICY "AP_COM002"
ON accounting_point_history
FOR SELECT
TO flex_common
USING (true);
