--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-product-application runOnChange:true endDelimiter:--

-- SPG product application status requested
CREATE OR REPLACE VIEW notice_spgpa_status_requested
WITH (security_invoker = false) AS (
    SELECT
        spgpa.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_application.status.requested'::ltree AS type, -- noqa
        'service_providing_group_product_application' AS source_resource,
        spgpa.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spgpa.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_product_application AS spgpa
    WHERE spgpa.status = 'requested'
);
