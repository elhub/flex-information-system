ALTER TABLE IF EXISTS accounting_point ENABLE ROW LEVEL SECURITY;

-- RLS: AP-COM001
GRANT SELECT ON accounting_point TO flex_common;
CREATE POLICY "AP_COM001"
ON accounting_point
FOR SELECT
TO flex_common
USING (true);
