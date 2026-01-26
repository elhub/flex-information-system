--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-product-suspension runAlways:true endDelimiter:--

-- Suspension on product type no longer qualified
DROP VIEW IF EXISTS notice_spgps_product_type_not_qualified CASCADE;
CREATE VIEW notice_spgps_product_type_not_qualified
WITH (security_invoker = false) AS (
    WITH
        qualified_product_types AS (
            SELECT
                spgpa.service_providing_group_id,
                spgpa.procuring_system_operator_id,
                array_agg(DISTINCT spgpa.product_type_id)
                    AS product_type_ids -- noqa
            FROM (
                SELECT
                    spgpa.service_providing_group_id,
                    spgpa.procuring_system_operator_id,
                    unnest(spgpa.product_type_ids) AS product_type_id
                FROM
                    flex.service_providing_group_product_application
                        AS spgpa -- noqa
                WHERE spg_product_application_ready_for_market_check(spgpa) -- noqa
            ) AS spgpa
            GROUP BY
                spgpa.service_providing_group_id,
                spgpa.procuring_system_operator_id
        )

    SELECT
        spgps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_suspension.product_type.not_qualified' AS type, -- noqa
        'service_providing_group_product_suspension' AS source_resource,
        spgps.id AS source_id,
        jsonb_build_object(
            'product_type_ids', (
                SELECT array(
                    SELECT unnest(spgps.product_type_ids)
                    EXCEPT
                    SELECT unnest(coalesce(qpts.product_type_ids, '{}'))
                )
            )
        ) AS data -- noqa
    FROM flex.service_providing_group_product_suspension AS spgps
        LEFT JOIN qualified_product_types AS qpts
            ON
                spgps.service_providing_group_id
                = qpts.service_providing_group_id
                AND spgps.procuring_system_operator_id
                = qpts.procuring_system_operator_id
    WHERE
        NOT spgps.product_type_ids
        <@ coalesce(qpts.product_type_ids, '{}')
);

-- Inactive suspension
DROP VIEW IF EXISTS notice_spgps_lingering CASCADE;
CREATE VIEW notice_spgps_lingering
WITH (security_invoker = false) AS (
    SELECT
        spgps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_suspension.lingering'
            AS type, -- noqa
        'service_providing_group_product_suspension' AS source_resource,
        spgps.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_product_suspension AS spgps
    WHERE
        lower(spgps.record_time_range)
        < current_timestamp - interval '2 weeks'
);
