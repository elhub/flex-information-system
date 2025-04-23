ALTER TABLE IF EXISTS accounting_point ENABLE ROW LEVEL SECURITY;

-- RLS: AP-FISO001
GRANT SELECT ON accounting_point
TO flex_flexibility_information_system_operator;
CREATE POLICY "AP_FISO001"
ON accounting_point
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: AP-BRP001
GRANT SELECT ON accounting_point
TO flex_balance_responsible_party;
CREATE POLICY "AP_BRP001"
ON accounting_point
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_balance_responsible_party AS apbrp
        WHERE apbrp.accounting_point_id = accounting_point.id -- noqa
    )
);

-- RLS: AP-ES001
GRANT SELECT ON accounting_point
TO flex_energy_supplier;
CREATE POLICY "AP_ES001"
ON accounting_point
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_energy_supplier AS apes
        WHERE apes.accounting_point_id = accounting_point.id --noqa
    )
);

-- RLS: AP-EU001
GRANT SELECT ON accounting_point
TO flex_end_user;
CREATE POLICY "AP_EU001"
ON accounting_point
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_end_user AS apeu
        WHERE apeu.accounting_point_id = accounting_point.id --noqa
    )
);

-- RLS: AP-SP001
GRANT SELECT ON accounting_point
TO flex_service_provider;
CREATE POLICY "AP_SP001"
ON accounting_point
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider AS cusp -- noqa
            INNER JOIN controllable_unit AS cu
                ON cu.id = cusp.controllable_unit_id
            INNER JOIN accounting_point AS ap
                ON ap.business_id = cusp.accounting_point_id
        WHERE cusp.service_provider_id = current_party()
            AND ap.id = accounting_point.id
    )
);
