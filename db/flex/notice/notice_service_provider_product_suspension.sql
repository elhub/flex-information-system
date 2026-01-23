--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-provider-product-suspension runAlways:true endDelimiter:--

-- Suspension on product type no longer qualified
DROP VIEW IF EXISTS notice_spps_product_type_not_qualified CASCADE;
CREATE VIEW notice_spps_product_type_not_qualified
WITH (security_invoker = false) AS (
    WITH
        qualified_product_types AS (
            SELECT
                sppa.service_provider_id,
                sppa.system_operator_id,
                array_agg(DISTINCT sppa.product_type_id) AS product_type_ids
            FROM (
                SELECT
                    sppa.service_provider_id,
                    sppa.system_operator_id,
                    unnest(sppa.product_type_ids) AS product_type_id
                FROM flex.service_provider_product_application AS sppa
                WHERE sp_product_application_ready_for_market_check(sppa) -- noqa
            ) AS sppa
            GROUP BY sppa.service_provider_id, sppa.system_operator_id
        )

    SELECT
        spps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_suspension.product_type.not_qualified' AS type, -- noqa
        'service_provider_product_suspension' AS source_resource,
        spps.id AS source_id,
        jsonb_build_object(
            'product_type_ids', (
                SELECT array(
                    SELECT unnest(spps.product_type_ids)
                    EXCEPT
                    SELECT unnest(coalesce(qpts.product_type_ids, '{}'))
                )
            )
        ) AS data -- noqa
    FROM flex.service_provider_product_suspension AS spps
        LEFT JOIN qualified_product_types AS qpts
            ON
                spps.service_provider_id = qpts.service_provider_id
                AND spps.procuring_system_operator_id
                = qpts.system_operator_id
    WHERE NOT spps.product_type_ids <@ coalesce(qpts.product_type_ids, '{}')
);

-- Inactive suspension
DROP VIEW IF EXISTS notice_spps_lingering CASCADE;
CREATE VIEW notice_spps_lingering
WITH (security_invoker = false) AS (
    SELECT
        spps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_suspension.lingering' AS type, -- noqa
        'service_provider_product_suspension' AS source_resource,
        spps.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.service_provider_product_suspension AS spps
    WHERE
        lower(spps.record_time_range) < current_timestamp - interval '2 weeks'
        AND NOT EXISTS (
            SELECT 1
            FROM flex.service_provider_product_suspension_comment AS sppsc
            WHERE
                spps.id = sppsc.service_provider_product_suspension_id
                AND lower(sppsc.record_time_range)
                >= current_timestamp - interval '2 weeks'
        )
);
