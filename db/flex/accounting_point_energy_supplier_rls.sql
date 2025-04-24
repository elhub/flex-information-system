ALTER TABLE IF EXISTS accounting_point_energy_supplier
ENABLE ROW LEVEL SECURITY;

-- RLS: APES-BRP001
GRANT SELECT ON accounting_point_energy_supplier
TO flex_balance_responsible_party;
CREATE POLICY "APES_BRP001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_balance_responsible_party AS apbrp
        WHERE apbrp.accounting_point_id = accounting_point_energy_supplier.accounting_point_id -- noqa
            AND apbrp.balance_responsible_party_id = current_party()
            AND apbrp.valid_time_range && accounting_point_energy_supplier.valid_time_range -- noqa
    )
);

-- RLS: APES-EU001
GRANT SELECT ON accounting_point_energy_supplier
TO flex_end_user;
CREATE POLICY "APES_EU001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_end_user AS apeu -- noqa
            INNER JOIN accounting_point AS ap
                ON ap.id = apeu.accounting_point_id
        WHERE ap.business_id = accounting_point_energy_supplier.accounting_point_id --noqa
            AND apeu.end_user_id = current_party()
            AND apeu.valid_time_range && accounting_point_energy_supplier.valid_time_range --noqa
    )
);

-- RLS: APES-ES001
GRANT SELECT ON accounting_point_energy_supplier
TO flex_energy_supplier;
CREATE POLICY "APES_ES001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_energy_supplier
USING (energy_supplier_id = current_party());

-- RLS: APES-FISO001
GRANT SELECT ON accounting_point_energy_supplier
TO flex_flexibility_information_system_operator;
CREATE POLICY "APES_FISO001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: APES-SP001
GRANT SELECT ON accounting_point
TO flex_service_provider;
CREATE POLICY "APES_SP001"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider AS cusp -- noqa
            INNER JOIN controllable_unit AS cu
                ON cu.id = cusp.controllable_unit_id
        WHERE cusp.service_provider_id = current_party()
            AND cu.accounting_point_id = accounting_point_energy_supplier.accounting_point_id -- noqa
            AND cusp.valid_time_range && accounting_point_energy_supplier.valid_time_range -- noqa
    )
);
