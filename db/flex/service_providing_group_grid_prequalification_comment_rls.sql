--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-providing-group-grid-prequalification-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
service_providing_group_grid_prequalification_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON service_providing_group_grid_prequalification_comment
TO flex_internal_event_notification;
CREATE POLICY "SPGGPC_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_prequalification_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON service_providing_group_grid_prequalification_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPGGPCH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_prequalification_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_providing_group_grid_prequalification_comment
TO flex_common;

-- RLS: SPGGPC-COM001
CREATE POLICY "SPGGPC_COM001"
ON service_providing_group_grid_prequalification_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPGGPC-SO001
-- RLS: SPGGPC-SP001
CREATE POLICY "SPGGPC_SO001_SP001"
ON service_providing_group_grid_prequalification_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification_involved_parties AS spggp_ip -- noqa
        WHERE spggp_ip.service_providing_group_grid_prequalification_id = service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id -- noqa
            AND spggp_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGPC-SO002
-- RLS: SPGGPC-SP002
CREATE POLICY "SPGGPC_SO002_SP002_same_party"
ON service_providing_group_grid_prequalification_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_grid_prequalification_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE
            comment_creator.id = service_providing_group_grid_prequalification_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPGGPC_SO002_SP002_any_involved_party"
ON service_providing_group_grid_prequalification_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_grid_prequalification_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification_involved_parties AS spggp_ip -- noqa
        WHERE spggp_ip.service_providing_group_grid_prequalification_id = service_providing_group_grid_prequalification_comment.service_providing_group_grid_prequalification_id -- noqa
            AND spggp_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
spggp_comment_latest_visibility(in_spggpc_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        spggp_history AS (
            SELECT
                spggpc.visibility,
                spggpc.record_time_range
            FROM flex.service_providing_group_grid_prequalification_comment AS spggpc -- noqa
            WHERE spggpc.id = in_spggpc_id
            UNION ALL
            SELECT
                spggpch.visibility,
                spggpch.record_time_range
            FROM flex.service_providing_group_grid_prequalification_comment_history AS spggpch -- noqa
            WHERE spggpch.id = in_spggpc_id
        )

    SELECT spggp_history.visibility
    FROM spggp_history
    ORDER BY spggp_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPGGPC-SO003
-- RLS: SPGGPC-SP003
GRANT SELECT
ON service_providing_group_grid_prequalification_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPGGPC_SO003_SP003_same_party"
ON service_providing_group_grid_prequalification_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spggp_comment_latest_visibility(
        service_providing_group_grid_prequalification_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE
            comment_creator.id = service_providing_group_grid_prequalification_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPGGPC_SO003_SP003_any_involved_party"
ON service_providing_group_grid_prequalification_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spggp_comment_latest_visibility(
        service_providing_group_grid_prequalification_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification_involved_parties AS spggp_ip -- noqa
        WHERE spggp_ip.service_providing_group_grid_prequalification_id = service_providing_group_grid_prequalification_comment_history.service_providing_group_grid_prequalification_id -- noqa
            AND spggp_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGPC-FISO001
CREATE POLICY "SPGGPC_FISO001"
ON service_providing_group_grid_prequalification_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGGPC-FISO002
CREATE POLICY "SPGGPC_FISO002"
ON service_providing_group_grid_prequalification_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
