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

-- SPG is inactive but still has live product applications
CREATE OR REPLACE VIEW notice_spgpa_spg_inactive
WITH (security_invoker = false) AS (
    SELECT
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_product_application.service_providing_group.inactive'::ltree AS type, -- noqa
        'service_providing_group' AS source_resource,
        spg.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spg.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group AS spg
    WHERE
        spg.status = 'inactive'
        AND EXISTS (
            SELECT 1
            FROM flex.service_providing_group_product_application AS spgpa
            WHERE
                spgpa.service_providing_group_id = spg.id
                AND spgpa.status NOT IN ('inactive', 'rejected')
        )
);
