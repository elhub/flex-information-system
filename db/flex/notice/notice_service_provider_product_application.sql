--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-provider-product-application runAlways:true endDelimiter:--

-- SP product application status requested
DROP VIEW IF EXISTS notice_sppa_status_requested CASCADE;
CREATE VIEW notice_sppa_status_requested
WITH (security_invoker = false) AS (
    SELECT
        sppa.system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_application.status.requested' AS type, -- noqa
        'service_provider_product_application' AS source_resource,
        sppa.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.service_provider_product_application AS sppa
    WHERE sppa.status = 'requested'
);
