--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-membership-rls runAlways:true endDelimiter:;
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

GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_membership
TO flex_flexibility_information_system_operator;

-- RLS: SPGM-FISO001
CREATE POLICY "SPGM_FISO001"
ON service_providing_group_membership
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGM-FISO002
CREATE POLICY "SPGM_FISO002_INSERT"
ON service_providing_group_membership
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK (true);
CREATE POLICY "SPGM_FISO002_UPDATE"
ON service_providing_group_membership
FOR UPDATE
TO flex_flexibility_information_system_operator
USING (true);
CREATE POLICY "SPGM_FISO002_DELETE"
ON service_providing_group_membership
FOR DELETE
TO flex_flexibility_information_system_operator
USING (true);

-- SPGM-SP
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_membership
TO flex_service_provider;

-- RLS: SPGM-SP001
CREATE POLICY "SPGM_SP001_INSERT"
ON service_providing_group_membership
FOR INSERT
TO flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT
            range_agg(cusp.valid_time_range)
                @> service_providing_group_membership.valid_time_range -- noqa
        FROM controllable_unit_service_provider AS cusp
            INNER JOIN service_providing_group AS spg
                ON cusp.service_provider_id = spg.service_provider_id
        WHERE spg.service_provider_id = (SELECT current_party())
            AND cusp.controllable_unit_id = service_providing_group_membership.controllable_unit_id -- noqa
            AND spg.id = service_providing_group_membership.service_providing_group_id -- noqa
            AND cusp.valid_time_range && service_providing_group_membership.valid_time_range -- noqa
    )
);
CREATE POLICY "SPGM_SP001_UPDATE"
ON service_providing_group_membership
FOR UPDATE
TO flex_service_provider
USING (
    EXISTS (
        SELECT
            range_agg(cusp.valid_time_range)
                @> service_providing_group_membership.valid_time_range -- noqa
        FROM controllable_unit_service_provider AS cusp
            INNER JOIN service_providing_group AS spg
                ON cusp.service_provider_id = spg.service_provider_id
        WHERE spg.service_provider_id = (SELECT current_party())
            AND cusp.controllable_unit_id = service_providing_group_membership.controllable_unit_id -- noqa
            AND spg.id = service_providing_group_membership.service_providing_group_id -- noqa
            AND cusp.valid_time_range && service_providing_group_membership.valid_time_range -- noqa
    )
);

-- RLS: SPGM-SP002
CREATE POLICY "SPGM_SP002"
ON service_providing_group_membership
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group
        WHERE service_providing_group_membership.service_providing_group_id = service_providing_group.id -- noqa
            AND service_providing_group.service_provider_id
            = (SELECT current_party())
    )
);

-- RLS: SPGM-SP003
CREATE POLICY "SPGM_SP003"
ON service_providing_group_membership
FOR DELETE
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group
        WHERE service_providing_group_membership.service_providing_group_id = service_providing_group.id -- noqa
            AND service_providing_group.service_provider_id
            = (SELECT current_party())
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
