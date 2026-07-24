--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-attachment-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_product_application_attachment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_product_application_attachment
TO flex_internal_event_notification;
DROP POLICY IF EXISTS "SPGPAA_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_attachment;
CREATE POLICY "SPGPAA_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_attachment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_product_application_attachment_history
TO flex_internal_event_notification;
DROP POLICY IF EXISTS "SPGPAA_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_attachment_history;
CREATE POLICY "SPGPAA_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_attachment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGPAA-FISO001
GRANT SELECT, INSERT, DELETE
ON service_providing_group_product_application_attachment
TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "SPGPAA_FISO001"
ON service_providing_group_product_application_attachment;
CREATE POLICY "SPGPAA_FISO001"
ON service_providing_group_product_application_attachment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPAA-SP001
GRANT SELECT, INSERT, DELETE
ON service_providing_group_product_application_attachment
TO flex_service_provider;
DROP POLICY IF EXISTS "SPGPAA_SP001"
ON service_providing_group_product_application_attachment;
CREATE POLICY "SPGPAA_SP001"
ON service_providing_group_product_application_attachment
FOR ALL
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group_product_application AS spgpa
            INNER JOIN service_providing_group AS spg
                ON spgpa.service_providing_group_id = spg.id
        WHERE
            spgpa.id
            = service_providing_group_product_application_attachment.service_providing_group_product_application_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPAA-COM001
GRANT SELECT ON service_providing_group_product_application_attachment
TO flex_common;
DROP POLICY IF EXISTS "SPGPAA_COM001"
ON service_providing_group_product_application_attachment;
CREATE POLICY "SPGPAA_COM001"
ON service_providing_group_product_application_attachment
FOR SELECT
TO flex_common
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application_involved_parties AS spgpa_ip -- noqa
        WHERE
            spgpa_ip.service_providing_group_product_application_id
            = service_providing_group_product_application_attachment.service_providing_group_product_application_id -- noqa
            AND spgpa_ip.party_id = (SELECT flex.current_party())
    )
);
