--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-providing-group-product-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
service_providing_group_product_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON service_providing_group_product_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "SPGPSC_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON service_providing_group_product_suspension_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPGPSCH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_suspension_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_providing_group_product_suspension_comment
TO flex_common;

-- RLS: SPGPSC-COM001
CREATE POLICY "SPGPSC_COM001"
ON service_providing_group_product_suspension_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPGPSC-SO001
-- RLS: SPGPSC-SP001
CREATE POLICY "SPGPSC_SO001_SP001"
ON service_providing_group_product_suspension_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_suspension_involved_parties AS spgps_ip -- noqa
        WHERE spgps_ip.service_providing_group_product_suspension_id = service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id -- noqa
            AND spgps_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPSC-SO002
-- RLS: SPGPSC-SP002
CREATE POLICY "SPGPSC_SO002_SP002_same_party"
ON service_providing_group_product_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_product_suspension_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id = service_providing_group_product_suspension_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPGPSC_SO002_SP002_any_involved_party"
ON service_providing_group_product_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_product_suspension_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_suspension_involved_parties AS spgps_ip -- noqa
        WHERE spgps_ip.service_providing_group_product_suspension_id = service_providing_group_product_suspension_comment.service_providing_group_product_suspension_id -- noqa
            AND spgps_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
spgps_comment_latest_visibility(in_spgpsc_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        spgps_history AS (
            SELECT
                spgpsc.visibility,
                spgpsc.record_time_range
            FROM flex.service_providing_group_product_suspension_comment AS spgpsc -- noqa
            WHERE spgpsc.id = in_spgpsc_id
            UNION ALL
            SELECT
                spgpsch.visibility,
                spgpsch.record_time_range
            FROM flex.service_providing_group_product_suspension_comment_history AS spgpsch -- noqa
            WHERE spgpsch.id = in_spgpsc_id
        )

    SELECT spgps_history.visibility
    FROM spgps_history
    ORDER BY spgps_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPGPSC-SO003
-- RLS: SPGPSC-SP003
GRANT SELECT
ON service_providing_group_product_suspension_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPGPSC_SO003_SP003_same_party"
ON service_providing_group_product_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spgps_comment_latest_visibility(
        service_providing_group_product_suspension_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = service_providing_group_product_suspension_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPGPSC_SO003_SP003_any_involved_party"
ON service_providing_group_product_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spgps_comment_latest_visibility(
        service_providing_group_product_suspension_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_suspension_involved_parties AS spgps_ip -- noqa
        WHERE spgps_ip.service_providing_group_product_suspension_id = service_providing_group_product_suspension_comment_history.service_providing_group_product_suspension_id -- noqa
            AND spgps_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPSC-FISO001
CREATE POLICY "SPGPSC_FISO001"
ON service_providing_group_product_suspension_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPSC-FISO002
CREATE POLICY "SPGPSC_FISO002"
ON service_providing_group_product_suspension_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
