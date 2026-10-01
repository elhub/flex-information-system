--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group
TO flex_internal_event_notification;
DROP POLICY IF EXISTS "SPG_INTERNAL_EVENT_NOTIFICATION" ON service_providing_group;
CREATE POLICY "SPG_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_history
TO flex_internal_event_notification;
DROP POLICY IF EXISTS "SPGH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_history;
CREATE POLICY "SPGH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPG-FISO001
GRANT SELECT, INSERT, UPDATE ON service_providing_group
TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "SPG_FISO001" ON service_providing_group;
CREATE POLICY "SPG_FISO001" ON service_providing_group
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPG-SP001
GRANT SELECT, INSERT, UPDATE ON service_providing_group
TO flex_service_provider;
DROP POLICY IF EXISTS "SPG_SP001" ON service_providing_group;
CREATE POLICY "SPG_SP001" ON service_providing_group
FOR ALL
TO flex_service_provider
USING (service_provider_id = (SELECT current_party()));

-- RLS: SPG-SO001
GRANT SELECT ON service_providing_group
TO flex_system_operator;
DROP POLICY IF EXISTS "SPG_SO001" ON service_providing_group;
CREATE POLICY "SPG_SO001" ON service_providing_group
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_grid_prequalification
        WHERE service_providing_group_grid_prequalification.service_providing_group_id = service_providing_group.id -- noqa
    )
);

-- RLS: SPG-SO002
DROP POLICY IF EXISTS "SPG_SO002" ON service_providing_group;
CREATE POLICY "SPG_SO002" ON service_providing_group
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_product_application spgpa -- noqa
        WHERE spgpa.service_providing_group_id = service_providing_group.id -- noqa
        AND spgpa.procuring_system_operator_id = (SELECT current_party()) -- noqa
    )
);
