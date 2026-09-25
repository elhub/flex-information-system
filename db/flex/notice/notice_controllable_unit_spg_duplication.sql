--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit-spg-duplication runOnChange:true endDelimiter:--

-- CU registered in multiple SPGs with active applications for the same product type
CREATE OR REPLACE VIEW notice_cu_spg_product_duplication
WITH (security_invoker = false) AS (
    WITH
        cu_spg_products AS (
            SELECT
                spgm.controllable_unit_id,
                spgm.service_providing_group_id,
                spgpa.procuring_system_operator_id,
                unnest(spgpa.product_type_ids) AS product_type_id
            FROM flex.service_providing_group_membership AS spgm
                INNER JOIN
                    flex.service_providing_group_product_application
                    AS spgpa -- noqa
                    ON spgm.service_providing_group_id
                        = spgpa.service_providing_group_id
            WHERE
                spgm.valid_time_range @> current_timestamp
                AND spg_product_application_ready_for_market_check(spgpa) -- noqa
        ),

        cu_spg_products_not_suspended AS (
            SELECT
                csp.controllable_unit_id,
                csp.service_providing_group_id,
                csp.procuring_system_operator_id,
                csp.product_type_id
            FROM cu_spg_products AS csp
            WHERE NOT EXISTS (
                    SELECT 1
                    FROM flex.service_providing_group_product_suspension
                    AS spgps -- noqa
                    WHERE
                        spgps.service_providing_group_id
                        = csp.service_providing_group_id
                        AND spgps.procuring_system_operator_id
                        = csp.procuring_system_operator_id
                        AND csp.product_type_id = any(spgps.product_type_ids)
                )
        ),

        duplicates AS (
            SELECT
                controllable_unit_id,
                product_type_id,
                procuring_system_operator_id,
                array_agg(DISTINCT service_providing_group_id)
                    AS service_providing_group_ids -- noqa
            FROM cu_spg_products_not_suspended
            GROUP BY
                controllable_unit_id,
                product_type_id,
                procuring_system_operator_id
            HAVING count(DISTINCT service_providing_group_id) > 1
        )

    SELECT
        dup.procuring_system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.service_providing_group.product_duplication'::ltree -- noqa
            AS type, -- noqa
        'controllable_unit' AS source_resource,
        dup.controllable_unit_id AS source_id,
        jsonb_build_object(
            'kind', 'notice.data.controllable_unit.product_duplication',
            'product_type_id', dup.product_type_id,
            'service_providing_group_ids', dup.service_providing_group_ids
        ) AS data, -- noqa
        md5(
            dup.controllable_unit_id::text
            || dup.product_type_id::text
            || dup.procuring_system_operator_id::text
        ) AS deduplication_key -- noqa
    FROM duplicates AS dup
);
