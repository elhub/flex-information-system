--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-service-provider-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS controllable_unit_service_provider
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON controllable_unit_service_provider
TO flex_internal_event_notification;
CREATE POLICY "CUSP_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_service_provider
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON controllable_unit_service_provider_history
TO flex_internal_event_notification;
CREATE POLICY "CUSPH_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: CUSP-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON controllable_unit_service_provider
TO flex_flexibility_information_system_operator;
CREATE POLICY "CUSP_FISO001"
ON controllable_unit_service_provider
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CUSP-SO001
GRANT SELECT ON controllable_unit_service_provider
TO flex_system_operator;

CREATE POLICY controllable_unit_service_provider_so
ON controllable_unit_service_provider
FOR ALL
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit.id = controllable_unit_service_provider.controllable_unit_id -- noqa
    )
);

-- RLS: CUSP-SP001
GRANT SELECT, INSERT, UPDATE, DELETE ON controllable_unit_service_provider
TO flex_service_provider;
CREATE POLICY controllable_unit_service_provider_sp
ON controllable_unit_service_provider
FOR ALL
TO flex_service_provider
USING (service_provider_id = (SELECT current_party()));

-- RLS: CUSP-EU001
GRANT SELECT ON controllable_unit_service_provider TO flex_end_user;
CREATE POLICY "CUSP_EU001"
ON controllable_unit_service_provider
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = controllable_unit_service_provider.controllable_unit_id -- noqa
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && controllable_unit_service_provider.valid_time_range -- noqa
    )
);

ALTER TABLE IF EXISTS controllable_unit_service_provider_history
ENABLE ROW LEVEL SECURITY;

-- RLS: CUSP-EU002
GRANT SELECT ON controllable_unit_service_provider_history
TO flex_end_user;
CREATE POLICY "CUSP_EU002"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_end_user
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = controllable_unit_service_provider_history.controllable_unit_id -- noqa
            -- this version of the CUSP in the history puts the contract in the
            -- period when the current party is the end user of the AP
            AND cueu.end_user_id = (SELECT current_party())
            AND cueu.valid_time_range && controllable_unit_service_provider_history.valid_time_range -- noqa
    )
);

-- RLS: CUSP-FISO002
GRANT SELECT ON controllable_unit_service_provider_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "CUSP_FISO001"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider_history.id = controllable_unit_service_provider.id -- noqa
    )
);

-- RLS: CUSP-SO002
GRANT SELECT ON controllable_unit_service_provider_history
TO flex_system_operator;
CREATE POLICY "CUSP_SO002"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider_history.id = controllable_unit_service_provider.id -- noqa
    )
);

-- RLS: CUSP-SP002
GRANT SELECT ON controllable_unit_service_provider_history
TO flex_service_provider;
CREATE POLICY "CUSP_SP002"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit_service_provider
        WHERE controllable_unit_service_provider_history.id = controllable_unit_service_provider.id -- noqa
    )
);
