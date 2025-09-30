--liquibase formatted sql
-- Manually managed file

-- changeset flex:technical-resource-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS technical_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS technical_resource_history ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON technical_resource TO flex_internal_event_notification;
CREATE POLICY "TRG_INTERNAL_EVENT_NOTIFICATION" ON technical_resource
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON technical_resource_history TO flex_internal_event_notification;
CREATE POLICY "TRH_INTERNAL_EVENT_NOTIFICATION" ON technical_resource_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: TR-BRP001
GRANT SELECT ON technical_resource TO flex_balance_responsible_party;
CREATE POLICY "TR_BRP001" ON technical_resource
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_balance_responsible_party AS cubrp
        WHERE cubrp.controllable_unit_id = technical_resource.controllable_unit_id -- noqa
            AND cubrp.balance_responsible_party_id = (SELECT current_party())
            AND cubrp.valid_time_range && technical_resource.record_time_range -- noqa
    )
);

-- RLS: TR-BRP002
GRANT SELECT ON technical_resource_history TO flex_balance_responsible_party;
CREATE POLICY "TR_BRP002"
ON technical_resource_history
FOR SELECT
TO flex_balance_responsible_party
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_balance_responsible_party AS cubrp
        WHERE cubrp.controllable_unit_id = technical_resource_history.controllable_unit_id -- noqa
            -- this version of the TR in the history was in effect when
            -- the current party was the balance responsible party of its AP
            AND cubrp.balance_responsible_party_id = (SELECT current_party())
            AND cubrp.valid_time_range && technical_resource_history.record_time_range -- noqa
    )
);

-- RLS: TR-EU001
GRANT SELECT ON technical_resource TO flex_end_user;
CREATE POLICY "TR_EU001" ON technical_resource
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = technical_resource.controllable_unit_id -- noqa
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && technical_resource.record_time_range -- noqa
    )
);

-- RLS: TR-EU002
GRANT SELECT ON technical_resource_history TO flex_end_user;
CREATE POLICY "TR_EU002"
ON technical_resource_history
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = technical_resource_history.controllable_unit_id -- noqa
            -- this version of the TR in the history was in effect
            -- when the current party was the end user of its AP
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && technical_resource_history.record_time_range -- noqa
    )
);

-- RLS: TR-ES001
GRANT SELECT ON technical_resource TO flex_energy_supplier;
CREATE POLICY "TR_ES001" ON technical_resource
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_energy_supplier AS cues
        WHERE cues.controllable_unit_id = technical_resource.controllable_unit_id -- noqa
            AND cues.energy_supplier_id = (SELECT current_party())
            AND cues.valid_time_range && technical_resource.record_time_range -- noqa
    )
);

-- RLS: TR-ES002
GRANT SELECT ON technical_resource_history TO flex_energy_supplier;
CREATE POLICY "TR_ES002"
ON technical_resource_history
FOR SELECT
TO flex_energy_supplier
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_energy_supplier AS cues
        WHERE cues.controllable_unit_id = technical_resource_history.controllable_unit_id -- noqa
            -- this version of the TR in the history was in effect
            -- when the current party was the energy supplier of its AP
            AND cues.energy_supplier_id = (SELECT current_party())
            AND cues.valid_time_range && technical_resource_history.record_time_range -- noqa
    )
);

-- RLS: TR-FISO001
GRANT INSERT,
SELECT,
UPDATE,
DELETE ON technical_resource TO flex_flexibility_information_system_operator;
CREATE POLICY "TR_FISO001" ON technical_resource
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: TR-FISO002
GRANT SELECT ON technical_resource_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "TR_FISO002" ON technical_resource_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: TR-SO001
GRANT SELECT ON technical_resource TO flex_system_operator;
CREATE POLICY "TR_SO001" ON technical_resource
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit.id = technical_resource.controllable_unit_id -- noqa
    )
);

-- RLS: TR-SO002
GRANT SELECT ON technical_resource_history
TO flex_system_operator;
CREATE POLICY "TR_SO002"
ON technical_resource_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit.id = technical_resource_history.controllable_unit_id -- noqa
    )
);

-- RLS: TR-SP001
GRANT INSERT, UPDATE, DELETE ON technical_resource TO flex_service_provider;
CREATE POLICY "TR_SP001" ON technical_resource
FOR ALL
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider cusp -- noqa
        WHERE cusp.controllable_unit_id = technical_resource.controllable_unit_id -- noqa
            AND cusp.service_provider_id = (SELECT current_party())
            AND cusp.valid_time_range @> current_timestamp
    )
);

-- RLS: TR-SP002
GRANT SELECT ON technical_resource TO flex_service_provider;
CREATE POLICY "TR_SP002" ON technical_resource
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = technical_resource.controllable_unit_id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = (SELECT current_party())
            AND controllable_unit_service_provider.valid_time_range
            && technical_resource.record_time_range -- noqa
    )
);

-- RLS: TR-SP003
GRANT SELECT ON technical_resource_history
TO flex_service_provider;
CREATE POLICY "TR_SP003"
ON technical_resource_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider.controllable_unit_id = technical_resource_history.controllable_unit_id -- noqa
            AND controllable_unit_service_provider.service_provider_id
            = (SELECT current_party())
            AND controllable_unit_service_provider.valid_time_range
            && technical_resource_history.record_time_range -- noqa
    )
);
