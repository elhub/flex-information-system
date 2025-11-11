--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:controllable-unit-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
controllable_unit_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON controllable_unit_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "CUSC_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON controllable_unit_suspension_comment_history
TO flex_internal_event_notification;
CREATE POLICY "CUSCH_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_suspension_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON controllable_unit_suspension_comment
TO flex_common;

-- RLS: CUSC-COM001
CREATE POLICY "CUSC_COM001"
ON controllable_unit_suspension_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: CUSC-SO001
-- RLS: CUSC-SP001
CREATE POLICY "CUSC_SO001_SP001"
ON controllable_unit_suspension_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit_suspension_involved_parties AS cus_ip -- noqa
        WHERE cus_ip.controllable_unit_suspension_id = controllable_unit_suspension_comment.controllable_unit_suspension_id -- noqa
            AND cus_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: CUSC-SO002
-- RLS: CUSC-SP002
CREATE POLICY "CUSC_SO002_SP002_same_party"
ON controllable_unit_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    controllable_unit_suspension_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id = controllable_unit_suspension_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "CUSC_SO002_SP002_any_involved_party"
ON controllable_unit_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    controllable_unit_suspension_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_suspension_involved_parties AS cus_ip -- noqa
        WHERE cus_ip.controllable_unit_suspension_id = controllable_unit_suspension_comment.controllable_unit_suspension_id -- noqa
            AND cus_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
cus_comment_latest_visibility(in_cusc_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        cus_history AS (
            SELECT
                cusc.visibility,
                cusc.record_time_range
            FROM flex.controllable_unit_suspension_comment AS cusc -- noqa
            WHERE cusc.id = in_cusc_id
            UNION ALL
            SELECT
                cusch.visibility,
                cusch.record_time_range
            FROM flex.controllable_unit_suspension_comment_history AS cusch -- noqa
            WHERE cusch.id = in_cusc_id
        )

    SELECT cus_history.visibility
    FROM cus_history
    ORDER BY cus_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: CUSC-SO003
-- RLS: CUSC-SP003
GRANT SELECT
ON controllable_unit_suspension_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "CUSC_SO003_SP003_same_party"
ON controllable_unit_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    cus_comment_latest_visibility(
        controllable_unit_suspension_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = controllable_unit_suspension_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "CUSC_SO003_SP003_any_involved_party"
ON controllable_unit_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    cus_comment_latest_visibility(
        controllable_unit_suspension_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_suspension_involved_parties AS cus_ip -- noqa
        WHERE cus_ip.controllable_unit_suspension_id = controllable_unit_suspension_comment_history.controllable_unit_suspension_id -- noqa
            AND cus_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: CUSC-FISO001
CREATE POLICY "CUSC_FISO001"
ON controllable_unit_suspension_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CUSC-FISO002
CREATE POLICY "CUSC_FISO002"
ON controllable_unit_suspension_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
