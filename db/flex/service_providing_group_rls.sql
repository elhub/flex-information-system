--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group
TO flex_internal_event_notification;
CREATE POLICY "SPG_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_history
TO flex_internal_event_notification;
CREATE POLICY "SPGH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE ON service_providing_group
TO flex_flexibility_information_system_operator;
-- RLS: SPG-FISO001
CREATE POLICY "SPG_FISO001" ON service_providing_group
FOR SELECT
TO flex_flexibility_information_system_operator
USING ('data:read' IN (SELECT flex.current_scopes()));
-- RLS: SPG-FISO002
CREATE POLICY "SPG_FISO002_INSERT" ON service_providing_group
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK ('data:manage' IN (SELECT flex.current_scopes()));
CREATE POLICY "SPG_FISO002_UPDATE" ON service_providing_group
FOR UPDATE
TO flex_flexibility_information_system_operator
USING ('data:manage' IN (SELECT flex.current_scopes()));

GRANT SELECT, INSERT, UPDATE ON service_providing_group
TO flex_service_provider;
-- RLS: SPG-SP001
CREATE POLICY "SPG_SP001" ON service_providing_group
FOR SELECT
TO flex_service_provider
USING (
    service_provider_id = (SELECT current_party())
    AND 'data:read' IN (SELECT flex.current_scopes())
);
-- RLS: SPG-SP002
CREATE POLICY "SPG_SP002_INSERT" ON service_providing_group
FOR INSERT
TO flex_service_provider
WITH CHECK (
    service_provider_id = (SELECT current_party())
    AND 'data:manage' IN (SELECT flex.current_scopes())
);
CREATE POLICY "SPG_SP002_UPDATE" ON service_providing_group
FOR UPDATE
TO flex_service_provider
USING (
    service_provider_id = (SELECT current_party())
    AND 'data:manage' IN (SELECT flex.current_scopes())
);

-- RLS: SPG-SO001
GRANT SELECT ON service_providing_group
TO flex_system_operator;
CREATE POLICY "SPG_SO001" ON service_providing_group
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_grid_prequalification
        WHERE service_providing_group_grid_prequalification.service_providing_group_id = service_providing_group.id -- noqa
    )
    AND 'data:read' IN (SELECT flex.current_scopes())
);

-- RLS: SPG-SO002
CREATE POLICY "SPG_SO002" ON service_providing_group
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group_product_application spgpa -- noqa
        WHERE spgpa.service_providing_group_id = service_providing_group.id -- noqa
        AND spgpa.procuring_system_operator_id = (SELECT current_party()) -- noqa
    )
    AND 'data:read' IN (SELECT flex.current_scopes())
);
