ALTER TABLE IF EXISTS accounting_point_balance_responsible_party
ENABLE ROW LEVEL SECURITY;

-- RLS: APBRP-BRP001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_balance_responsible_party;
CREATE POLICY "APBRP_BRP001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_common
USING (balance_responsible_party_id = current_party());

-- RLS: APBRP-FISO001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_flexibility_information_system_operator;
CREATE POLICY "APBRP_FISO001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: APBRP-EU001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_end_user;
CREATE POLICY "APBRP_EU001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_end_user AS apeu
        WHERE apeu.accounting_point_id = accounting_point_balance_responsible_party.accounting_point_id --noqa
            AND apeu.end_user_id = current_party()
            AND apeu.valid_time_range && accounting_point_balance_responsible_party.valid_time_range --noqa
    )
);

-- RLS: APBRP-ES001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_energy_supplier;
CREATE POLICY "APBRP_ES001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1 FROM accounting_point_energy_supplier AS apes
        WHERE apes.accounting_point_id = accounting_point_balance_responsible_party.accounting_point_id --noqa
            AND apes.energy_supplier_id = current_party()
            AND apes.valid_time_range && accounting_point_balance_responsible_party.valid_time_range --noqa
    )
);

-- RLS: APBRP-FISO001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_flexibility_information_system_operator;
CREATE POLICY "APBRP_FISO001"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: APBRP-SP001
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_service_provider;
CREATE POLICY "APBRP_SP001"
ON accounting_point_balance_responsible_party
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
            AND ap.id = accounting_point_balance_responsible_party.accounting_point_id -- noqa
            AND cusp.valid_time_range && accounting_point_balance_responsible_party.valid_time_range -- noqa
    )
);
