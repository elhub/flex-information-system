--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
service_provider_product_application_involved_parties
WITH (security_invoker = false)
AS (
    SELECT
        sppa.id AS service_provider_product_application_id,
        unnest(ARRAY[
            sppa.system_operator_id,
            sppa.service_provider_id
        ]) AS party_id
    FROM flex.service_provider_product_application AS sppa
    UNION
    SELECT
        sppah.id,
        unnest(ARRAY[
            sppah.system_operator_id,
            sppah.service_provider_id
        ]) AS party_id
    FROM flex.service_provider_product_application_history AS sppah
);

-- changeset flex:service-provider-product-application-involved-parties-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE
service_provider_product_application_involved_parties
TO flex_common;

GRANT SELECT ON TABLE
service_provider_product_application_involved_parties
TO flex_internal_event_notification;
