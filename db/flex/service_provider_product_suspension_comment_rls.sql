--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:service-provider-product-suspension-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
service_provider_product_suspension_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON service_provider_product_suspension_comment
TO flex_internal_event_notification;
CREATE POLICY "SPPSC_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON service_provider_product_suspension_comment_history
TO flex_internal_event_notification;
CREATE POLICY "SPPSCH_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_suspension_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_provider_product_suspension_comment
TO flex_common;

-- RLS: SPPSC-COM001
CREATE POLICY "SPPSC_COM001"
ON service_provider_product_suspension_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPPSC-SO001
-- RLS: SPPSC-SP001
CREATE POLICY "SPPSC_SO001_SP001"
ON service_provider_product_suspension_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension_involved_parties AS spps_ip -- noqa
        WHERE spps_ip.service_provider_product_suspension_id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPPSC-SO002
-- RLS: SPPSC-SP002
CREATE POLICY "SPPSC_SO002_SP002_same_party"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_provider_product_suspension_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id = service_provider_product_suspension_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "SPPSC_SO002_SP002_any_involved_party"
ON service_provider_product_suspension_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    service_provider_product_suspension_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension_involved_parties AS spps_ip -- noqa
        WHERE spps_ip.service_provider_product_suspension_id = service_provider_product_suspension_comment.service_provider_product_suspension_id -- noqa
            AND spps_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
spps_comment_latest_visibility(in_sppsc_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        spps_history AS (
            SELECT
                sppsc.visibility,
                sppsc.record_time_range
            FROM flex.service_provider_product_suspension_comment AS sppsc -- noqa
            WHERE sppsc.id = in_sppsc_id
            UNION ALL
            SELECT
                sppsch.visibility,
                sppsch.record_time_range
            FROM flex.service_provider_product_suspension_comment_history AS sppsch -- noqa
            WHERE sppsch.id = in_sppsc_id
        )

    SELECT spps_history.visibility
    FROM spps_history
    ORDER BY spps_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: SPPSC-SO003
-- RLS: SPPSC-SP003
GRANT SELECT
ON service_provider_product_suspension_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "SPPSC_SO003_SP003_same_party"
ON service_provider_product_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spps_comment_latest_visibility(
        service_provider_product_suspension_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE comment_creator.id
        = service_provider_product_suspension_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "SPPSC_SO003_SP003_any_involved_party"
ON service_provider_product_suspension_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    spps_comment_latest_visibility(
        service_provider_product_suspension_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.service_provider_product_suspension_involved_parties AS spps_ip -- noqa
        WHERE spps_ip.service_provider_product_suspension_id = service_provider_product_suspension_comment_history.service_provider_product_suspension_id -- noqa
            AND spps_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: SPPSC-FISO001
CREATE POLICY "SPPSC_FISO001"
ON service_provider_product_suspension_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPPSC-FISO002
CREATE POLICY "SPPSC_FISO002"
ON service_provider_product_suspension_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
