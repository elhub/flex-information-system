ALTER TABLE IF EXISTS technical_resource ENABLE ROW LEVEL SECURITY;
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

-- RLS: TR-FISO001
GRANT INSERT,
SELECT,
UPDATE,
DELETE ON technical_resource TO flex_flexibility_information_system_operator;
CREATE POLICY "TR_FISO001" ON technical_resource
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: TR-COM002
GRANT SELECT ON technical_resource TO flex_common;
CREATE POLICY "TR_COM002" ON technical_resource
FOR SELECT
TO flex_common
USING (
    EXISTS (
        SELECT 1
        FROM controllable_unit
        WHERE controllable_unit.id = technical_resource.controllable_unit_id -- noqa
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
            AND cusp.service_provider_id = current_party()
    )
);
