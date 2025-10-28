--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-provider-product-application-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
service_provider_product_application_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON service_provider_product_application_comment
TO flex_internal_event_notification;
CREATE POLICY "SPPAC_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON service_provider_product_application_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPPACH_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_provider_product_application_comment
TO flex_common;

-- RLS: SPPAC-COM001
CREATE POLICY "SPPAC_COM001"
ON service_provider_product_application_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPPAC-SO001
-- RLS: SPPAC-SP001
CREATE POLICY "SPPAC_SO001_SP001"
ON service_provider_product_application_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application_involved_parties AS sppa_ip -- noqa
        WHERE sppa_ip.service_provider_product_application_id = service_provider_product_application_comment.service_provider_product_application_id -- noqa
            AND sppa_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPPAC-SO002
-- RLS: SPPAC-SP002
CREATE POLICY "SPPAC_SO002_SP002_same_party"
ON service_provider_product_application_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_provider_product_application_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id = service_provider_product_application_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPPAC_SO002_SP002_any_involved_party"
ON service_provider_product_application_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_provider_product_application_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application_involved_parties AS sppa_ip -- noqa
        WHERE sppa_ip.service_provider_product_application_id = service_provider_product_application_comment.service_provider_product_application_id -- noqa
            AND sppa_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
sppa_comment_latest_visibility(in_sppac_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        sppa_history AS (
            SELECT
                sppac.visibility,
                sppac.record_time_range
            FROM flex.service_provider_product_application_comment AS sppac -- noqa
            WHERE sppac.id = in_sppac_id
            UNION ALL
            SELECT
                sppach.visibility,
                sppach.record_time_range
            FROM flex.service_provider_product_application_comment_history AS sppach -- noqa
            WHERE sppach.id = in_sppac_id
        )

    SELECT sppa_history.visibility
    FROM sppa_history
    ORDER BY sppa_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPPAC-SO003
-- RLS: SPPAC-SP003
GRANT SELECT
ON service_provider_product_application_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPPAC_SO003_SP003_same_party"
ON service_provider_product_application_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    sppa_comment_latest_visibility(
        service_provider_product_application_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = service_provider_product_application_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPPAC_SO003_SP003_any_involved_party"
ON service_provider_product_application_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    sppa_comment_latest_visibility(
        service_provider_product_application_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application_involved_parties AS sppa_ip -- noqa
        WHERE sppa_ip.service_provider_product_application_id = service_provider_product_application_comment_history.service_provider_product_application_id -- noqa
            AND sppa_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPPAC-FISO001
CREATE POLICY "SPPAC_FISO001"
ON service_provider_product_application_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPPAC-FISO002
CREATE POLICY "SPPAC_FISO002"
ON service_provider_product_application_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
