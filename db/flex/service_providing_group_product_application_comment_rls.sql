--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-providing-group-product-application-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
service_providing_group_product_application_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON service_providing_group_product_application_comment
TO flex_internal_event_notification;
CREATE POLICY "SPGPAC_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON service_providing_group_product_application_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPGPACH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_providing_group_product_application_comment
TO flex_common;

-- RLS: SPGPAC-COM001
CREATE POLICY "SPGPAC_COM001"
ON service_providing_group_product_application_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPGPAC-SO001
-- RLS: SPGPAC-SP001
CREATE POLICY "SPGPAC_SO001_SP001"
ON service_providing_group_product_application_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application_involved_parties AS spgpa_ip -- noqa
        WHERE spgpa_ip.service_providing_group_product_application_id = service_providing_group_product_application_comment.service_providing_group_product_application_id -- noqa
            AND spgpa_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPAC-SO002
-- RLS: SPGPAC-SP002
CREATE POLICY "SPGPAC_SO002_SP002_same_party"
ON service_providing_group_product_application_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_product_application_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id = service_providing_group_product_application_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPGPAC_SO002_SP002_any_involved_party"
ON service_providing_group_product_application_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_providing_group_product_application_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application_involved_parties AS spgpa_ip -- noqa
        WHERE spgpa_ip.service_providing_group_product_application_id = service_providing_group_product_application_comment.service_providing_group_product_application_id -- noqa
            AND spgpa_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
spgpa_comment_latest_visibility(in_spgpac_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        spgpa_history AS (
            SELECT
                spgpac.visibility,
                spgpac.record_time_range
            FROM flex.service_providing_group_product_application_comment AS spgpac -- noqa
            WHERE spgpac.id = in_spgpac_id
            UNION ALL
            SELECT
                spgpach.visibility,
                spgpach.record_time_range
            FROM flex.service_providing_group_product_application_comment_history AS spgpach -- noqa
            WHERE spgpach.id = in_spgpac_id
        )

    SELECT spgpa_history.visibility
    FROM spgpa_history
    ORDER BY spgpa_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPGPAC-SO003
-- RLS: SPGPAC-SP003
GRANT SELECT
ON service_providing_group_product_application_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPGPAC_SO003_SP003_same_party"
ON service_providing_group_product_application_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spgpa_comment_latest_visibility(
        service_providing_group_product_application_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE
            comment_creator.id
        = service_providing_group_product_application_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPGPAC_SO003_SP003_any_involved_party"
ON service_providing_group_product_application_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spgpa_comment_latest_visibility(
        service_providing_group_product_application_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application_involved_parties AS spgpa_ip -- noqa
        WHERE spgpa_ip.service_providing_group_product_application_id = service_providing_group_product_application_comment_history.service_providing_group_product_application_id -- noqa
            AND spgpa_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPAC-FISO001
CREATE POLICY "SPGPAC_FISO001"
ON service_providing_group_product_application_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPAC-FISO002
CREATE POLICY "SPGPAC_FISO002"
ON service_providing_group_product_application_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
