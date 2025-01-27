ALTER TABLE IF EXISTS service_providing_group_membership
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_membership
TO flex_internal_event_notification;
CREATE POLICY "SPGM_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_membership
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_membership_history
TO flex_internal_event_notification;
CREATE POLICY "SPGMH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_membership_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGM-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_membership
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGM_FISO001"
ON service_providing_group_membership
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- SPGM-SP
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_membership
TO flex_service_provider;

-- RLS: SPGM-SP001
-- RLS: SPGM-SP002
CREATE POLICY "SPGM_SP001_SP002"
ON service_providing_group_membership
FOR ALL
TO flex_service_provider
USING (EXISTS (
    SELECT 1
    FROM service_providing_group
    WHERE service_providing_group_membership.service_providing_group_id = service_providing_group.id -- noqa
        AND service_providing_group.service_provider_id = current_party()
))
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM service_providing_group, controllable_unit_service_provider
        WHERE service_providing_group_membership.service_providing_group_id = service_providing_group.id -- noqa
            AND service_providing_group.service_provider_id = current_party()
            AND service_providing_group_membership.controllable_unit_id --noqa
            = controllable_unit_service_provider.controllable_unit_id
            AND controllable_unit_service_provider.service_provider_id
            = current_party()
    )
);

-- RLS: SPGM-SO001
GRANT SELECT ON service_providing_group_membership
TO flex_system_operator;
CREATE POLICY "SPGM_SO001"
ON service_providing_group_membership
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group
        WHERE service_providing_group_membership.service_providing_group_id = service_providing_group.id -- noqa
    )
);
