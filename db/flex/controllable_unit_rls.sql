--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS controllable_unit ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON controllable_unit TO flex_internal_event_notification;
CREATE POLICY "CU_INTERNAL_EVENT_NOTIFICATION" ON controllable_unit
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON controllable_unit_history TO flex_internal_event_notification;
CREATE POLICY "CUH_INTERNAL_EVENT_NOTIFICATION" ON controllable_unit
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE ON controllable_unit
TO flex_flexibility_information_system_operator;
-- RLS: CU-FISO001
CREATE POLICY "CU_FISO001" ON controllable_unit
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
-- RLS: CU-FISO002
CREATE POLICY "CU_FISO002_INSERT" ON controllable_unit
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK (true);
CREATE POLICY "CU_FISO002_UPDATE" ON controllable_unit
FOR UPDATE
TO flex_flexibility_information_system_operator
USING (true);

GRANT SELECT, UPDATE ON controllable_unit TO flex_system_operator;
-- RLS: CU-SO001
CREATE POLICY "CU_SO001" ON controllable_unit
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = controllable_unit.accounting_point_id -- noqa
            AND ap_so.system_operator_id = (SELECT current_party())
            AND ap_so.valid_time_range @> current_timestamp
    )
);
-- RLS: CU-SO002
CREATE POLICY "CU_SO002" ON controllable_unit
FOR UPDATE
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = controllable_unit.accounting_point_id -- noqa
            AND ap_so.system_operator_id = (SELECT current_party())
            AND ap_so.valid_time_range @> current_timestamp
    )
);

-- RLS: CU-SO003
CREATE POLICY "CU_SO003" ON controllable_unit
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_membership
        WHERE service_providing_group_membership.controllable_unit_id = controllable_unit.id -- noqa
    )
);

GRANT SELECT, INSERT, UPDATE ON controllable_unit TO flex_service_provider;
-- RLS: CU-SP001
-- RLS: CU-SP005
CREATE POLICY "CU_SP001_SP005" ON controllable_unit
FOR SELECT
TO flex_service_provider
USING (
    -- SP should see that current data only if their
    -- contract overlaps with the record time
    (EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = controllable_unit.id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = (SELECT current_party())
            AND controllable_unit_service_provider.valid_time_range
            && controllable_unit.record_time_range -- noqa
    ) OR (
        -- the SP created the CU
        created_by_party_id = (SELECT current_party())
    ))
);

-- RLS: CU-SP002
CREATE POLICY "CU_SP002" ON controllable_unit
FOR INSERT
TO flex_service_provider
WITH CHECK (true);

-- RLS: CU-SP003
CREATE POLICY "CU_SP003" ON controllable_unit
FOR UPDATE
TO flex_service_provider
USING (
    -- the active contract of the CU is the SP
    EXISTS (
        SELECT 1 FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = controllable_unit.id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = (SELECT current_party())
            AND controllable_unit_service_provider.valid_time_range
            @> current_timestamp
    )
);

-- RLS: CU-EU001
GRANT SELECT ON controllable_unit TO flex_end_user;
CREATE POLICY "CU_EU001" ON controllable_unit
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = controllable_unit.id -- noqa
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && controllable_unit.record_time_range -- noqa
    )
);

-- RLS: CU-ES001
GRANT SELECT ON controllable_unit TO flex_energy_supplier;
CREATE POLICY "CU_ES001" ON controllable_unit
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_energy_supplier AS cues
        WHERE cues.controllable_unit_id = controllable_unit.id -- noqa
            AND cues.energy_supplier_id = (SELECT current_party())
            AND cues.valid_time_range && controllable_unit.record_time_range -- noqa
    )
);

-- RLS: CU-BRP001
GRANT SELECT ON controllable_unit TO flex_balance_responsible_party;
CREATE POLICY "CU_BRP001" ON controllable_unit
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_balance_responsible_party AS cubrp
        WHERE cubrp.controllable_unit_id = controllable_unit.id -- noqa
            AND cubrp.balance_responsible_party_id = (SELECT current_party())
            AND cubrp.valid_time_range && controllable_unit.record_time_range -- noqa
    )
);

ALTER TABLE IF EXISTS controllable_unit_history
ENABLE ROW LEVEL SECURITY;

-- RLS: CU-EU002
GRANT SELECT ON controllable_unit_history TO flex_end_user;
CREATE POLICY "CU_EU002"
ON controllable_unit_history
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = controllable_unit_history.id -- noqa
            -- this version of the CU in the history was in effect
            -- when the current party was the end user of its AP
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && controllable_unit_history.record_time_range -- noqa
    )
);

-- RLS: CU-ES002
GRANT SELECT ON controllable_unit_history TO flex_energy_supplier;
CREATE POLICY "CU_ES002"
ON controllable_unit_history
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_energy_supplier AS cues
        WHERE cues.controllable_unit_id = controllable_unit_history.id -- noqa
            -- this version of the CU in the history was in effect
            -- when the current party was the energy supplier of its AP
            AND cues.energy_supplier_id = (SELECT current_party())
            AND cues.valid_time_range && controllable_unit_history.record_time_range -- noqa
    )
);

-- RLS: CU-BRP002
GRANT SELECT ON controllable_unit_history TO flex_balance_responsible_party;
CREATE POLICY "CU_BRP002"
ON controllable_unit_history
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_balance_responsible_party AS cubrp
        WHERE cubrp.controllable_unit_id = controllable_unit_history.id -- noqa
            -- this version of the CU in the history was in effect when
            -- the current party was the balance responsible party of its AP
            AND cubrp.balance_responsible_party_id = (SELECT current_party())
            AND cubrp.valid_time_range && controllable_unit_history.record_time_range -- noqa
    )
);

-- RLS: CU-FISO003
GRANT SELECT ON controllable_unit_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "CU_FISO003"
ON controllable_unit_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CU-SO004
GRANT SELECT ON controllable_unit_history
TO flex_system_operator;
CREATE POLICY "CU_SO004"
ON controllable_unit_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit_history.id = controllable_unit.id -- noqa
    )
);

-- RLS: CU-SP004
GRANT SELECT ON controllable_unit_history
TO flex_service_provider;
CREATE POLICY "CU_SP004"
ON controllable_unit_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = controllable_unit_history.id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = (SELECT current_party())
            AND controllable_unit_service_provider.valid_time_range
            && controllable_unit_history.record_time_range -- noqa
    )
);
