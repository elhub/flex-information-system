--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:service-providing-group-power-per-substation-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW service_providing_group_power_per_substation
WITH (security_invoker = false) AS (
    SELECT
        spg.id,
        spg.id AS service_providing_group_id,
        -- per-substation aggregates
        -- NB (COALESCE): a SPG can be empty
        COALESCE(
            (
                -- build one JSON object per substation details row and collect
                -- into a single array field
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'substation_business_id',
                        per_substation_details.substation_business_id,
                        'substation_name',
                        per_substation_details.substation_name,
                        'controllable_unit', JSONB_BUILD_OBJECT(
                            'count', per_substation_details.cu_count,
                            'maximum_active_power', JSONB_BUILD_OBJECT(
                                'sum', per_substation_details.cu_sum_map,
                                'average', per_substation_details.cu_avg_map,
                                'min', per_substation_details.cu_min_map,
                                'max', per_substation_details.cu_max_map
                            )
                        )
                    )
                )
                FROM (
                    -- current memberships, grouped by location, then for each
                    -- location we compute the rated effect (sum of TR MAP)
                    -- (CUs without location end up in a common row with null as
                    -- substation so that we do not show partial information)
                    SELECT
                        apgl.business_id AS substation_business_id,
                        apgl.name AS substation_name,
                        COUNT(spgm.controllable_unit_id) AS cu_count,
                        SUM(cu_details.cu_map) AS cu_sum_map,
                        AVG(cu_details.cu_map) AS cu_avg_map,
                        MIN(cu_details.cu_map) AS cu_min_map,
                        MAX(cu_details.cu_map) AS cu_max_map
                    FROM flex.service_providing_group_membership AS spgm
                        INNER JOIN flex.controllable_unit AS cu
                            ON spgm.controllable_unit_id = cu.id
                        INNER JOIN flex.accounting_point AS ap
                            ON cu.accounting_point_id = ap.id
                        LEFT JOIN flex.accounting_point_grid_location AS apgl
                            ON ap.id = apgl.accounting_point_id
                        LEFT JOIN LATERAL (
                            -- NB (COALESCE): a CU can have 0 TR
                            SELECT COALESCE(SUM(tr.maximum_active_power), 0)
                                AS cu_map
                            FROM flex.technical_resource AS tr
                            WHERE tr.controllable_unit_id
                                = spgm.controllable_unit_id
                        ) AS cu_details ON TRUE
                    WHERE spgm.service_providing_group_id = spg.id
                        AND spgm.valid_time_range @> current_timestamp
                    GROUP BY apgl.business_id, apgl.name
                ) AS per_substation_details
            ),
            '[]'::jsonb
        ) AS substations
    FROM flex.service_providing_group AS spg
);

-- changeset flex:service-providing-group-power-per-substation-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_power_per_substation TO flex_common;
