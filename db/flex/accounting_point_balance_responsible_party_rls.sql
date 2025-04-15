ALTER TABLE IF EXISTS accounting_point_balance_responsible_party
ENABLE ROW LEVEL SECURITY;

-- RLS: APBRP-COM001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_common;
CREATE POLICY "APBRP_COM001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_common
USING (true);

-- RLS: APBRP-COM002
GRANT SELECT ON accounting_point_balance_responsible_party_history
TO flex_common;
CREATE POLICY "APBRP_COM002"
ON accounting_point_balance_responsible_party_history
FOR SELECT
TO flex_common
USING (true);
