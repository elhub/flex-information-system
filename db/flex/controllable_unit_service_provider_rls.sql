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
USING (service_provider_id = current_party());
