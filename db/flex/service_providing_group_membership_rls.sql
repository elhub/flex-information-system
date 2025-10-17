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

-- RLS: SPGM-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_membership
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGM_FISO001"
ON service_providing_group_membership
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGM-FISO002
GRANT SELECT ON service_providing_group_membership_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGM_FISO002"
ON service_providing_group_membership_history
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
        AND service_providing_group.service_provider_id
        = (SELECT current_party())
))
WITH CHECK (
    EXISTS (
        -- part of the CUSP timeline for this SP and this CU that overlaps with
        -- the valid time of the tentative SPG membership
        WITH
            cusp_spgm_timeline_overlap AS (
                SELECT range_agg(cusp.valid_time_range) AS timeline
                FROM controllable_unit_service_provider AS cusp
                    INNER JOIN service_providing_group AS spg
                        ON cusp.service_provider_id = spg.service_provider_id
                WHERE spg.service_provider_id = (SELECT current_party())
                    AND cusp.controllable_unit_id
                    = service_providing_group_membership.controllable_unit_id -- noqa
                    AND spg.id
                    = service_providing_group_membership.service_providing_group_id -- noqa
                    AND cusp.valid_time_range
                    && service_providing_group_membership.valid_time_range -- noqa
            )

        -- the valid time must be totally covered
        SELECT 1
        FROM cusp_spgm_timeline_overlap AS t
        WHERE t.timeline @> service_providing_group_membership.valid_time_range -- noqa
    )
);

-- RLS: SPGM-SP003
-- SPG cannot be deleted, SP ID is stable, no need to use history
GRANT SELECT ON service_providing_group_membership_history
TO flex_service_provider;
CREATE POLICY "SPGM_SP003"
ON service_providing_group_membership_history
FOR SELECT
TO flex_service_provider
USING (EXISTS (
    SELECT 1
    FROM service_providing_group
    WHERE service_providing_group_membership_history.service_providing_group_id = service_providing_group.id -- noqa
        AND service_providing_group.service_provider_id
        = (SELECT current_party())
));

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

-- RLS: SPGM-SO002
-- read access to SPG on SO is based on SPGPA/SPGGP, both have stable RLS for SO
-- through history (once they become visible, it cannot be removed later)
-- so we can use SPG for SO in a history policy as well
GRANT SELECT ON service_providing_group_membership_history
TO flex_system_operator;
CREATE POLICY "SPGM_SO002"
ON service_providing_group_membership_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group
        WHERE service_providing_group_membership_history.service_providing_group_id = service_providing_group.id -- noqa
    )
);
