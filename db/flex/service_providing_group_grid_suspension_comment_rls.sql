--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_grid_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_grid_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "SPGGSC_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_grid_suspension_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPGGSCH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_suspension_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_providing_group_grid_suspension_comment
TO flex_common;

-- RLS: SPGGSC-COM001
CREATE POLICY "SPGGSC_COM001"
ON service_providing_group_grid_suspension_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPGGSC-SO001
-- RLS: SPGGSC-SP001
CREATE POLICY "SPGGSC_SO001_SP001"
ON service_providing_group_grid_suspension_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_suspension_involved_parties AS spggs_ip -- noqa
        WHERE spggs_ip.service_providing_group_grid_suspension_id
        = service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id -- noqa
            AND spggs_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGSC-SO002
-- RLS: SPGGSC-SP002
CREATE POLICY "SPGGSC_SO002_SP002_same_party"
ON service_providing_group_grid_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_grid_suspension_comment.visibility = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = service_providing_group_grid_suspension_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPGGSC_SO002_SP002_any_involved_party"
ON service_providing_group_grid_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_grid_suspension_comment.visibility
    = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_suspension_involved_parties AS spggs_ip -- noqa
        WHERE spggs_ip.service_providing_group_grid_suspension_id
        = service_providing_group_grid_suspension_comment.service_providing_group_grid_suspension_id -- noqa
            AND spggs_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION spggs_comment_latest_visibility(id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        spggs_history AS (
            SELECT
                spggsc.visibility,
                spggsc.record_time_range
            FROM flex.service_providing_group_grid_suspension_comment AS spggsc
            WHERE spggsc.id = id
            UNION ALL
            SELECT
                spggsch.visibility,
                spggsch.record_time_range
            FROM flex.service_providing_group_grid_suspension_comment_history
                AS spggsch -- noqa
            WHERE spggsch.id = id
        )

    SELECT spggs_history.visibility
    FROM spggs_history
    ORDER BY spggs_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPGGSC-SO003
-- RLS: SPGGSC-SP003
GRANT SELECT ON service_providing_group_grid_suspension_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPGGSC_SO003_SP003_same_party"
ON service_providing_group_grid_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spggs_comment_latest_visibility(
        service_providing_group_grid_suspension_comment_history.id
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = service_providing_group_grid_suspension_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPGGSC_SO003_SP003_any_involved_party"
ON service_providing_group_grid_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spggs_comment_latest_visibility(
        service_providing_group_grid_suspension_comment_history.id
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_suspension_involved_parties AS spggs_ip -- noqa
        WHERE spggs_ip.service_providing_group_grid_suspension_id
        = service_providing_group_grid_suspension_comment_history.service_providing_group_grid_suspension_id -- noqa
            AND spggs_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGSC-FISO001
CREATE POLICY "SPGGSC_FISO001"
ON service_providing_group_grid_suspension_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGGSC-FISO002
CREATE POLICY "SPGGSC_FISO002"
ON service_providing_group_grid_suspension_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
