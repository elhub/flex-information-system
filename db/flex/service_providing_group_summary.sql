--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:service-providing-group-summary-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW service_providing_group_summary
WITH (security_invoker = false) AS (
    SELECT
        spg.id,
        spg.id AS service_providing_group_id,
        -- technical resource aggregates
        JSONB_BUILD_OBJECT(
            -- all TRs in the SPG
            'count', tr_aggregates.tr_count,
            'maximum_active_power', JSONB_BUILD_OBJECT(
                'sum', tr_aggregates.tr_sum_map,
                'average', tr_aggregates.tr_avg_map,
                'min', tr_aggregates.tr_min_map,
                'max', tr_aggregates.tr_max_map
            ),
            'by_category', COALESCE(
                (
                    SELECT JSONB_OBJECT_AGG(cat, stats)
                    FROM (
                        SELECT
                            cat,
                            JSONB_BUILD_OBJECT(
                                'count', COUNT(tr.id),
                                'maximum_active_power', JSONB_BUILD_OBJECT(
                                    'sum', COALESCE(
                                        SUM(tr.maximum_active_power), 0
                                    ),
                                    'average', COALESCE(
                                        AVG(tr.maximum_active_power), 0
                                    ),
                                    'min', MIN(tr.maximum_active_power),
                                    'max', MAX(tr.maximum_active_power)
                                )
                            ) AS stats
                        -- all TRs currently in the SPG, grouped by category
                        FROM flex.service_providing_group_membership AS spgm
                            LEFT JOIN flex.technical_resource AS tr
                                ON spgm.controllable_unit_id
                                    = tr.controllable_unit_id,
                            UNNEST(tr.category) AS cat
                        WHERE spgm.service_providing_group_id = spg.id
                            AND spgm.valid_time_range @> current_timestamp
                        GROUP BY cat
                    ) AS cat_aggregates
                ),
                '{}'::jsonb
            ),
            'by_technology', COALESCE(
                (
                    SELECT JSONB_OBJECT_AGG(tech, stats)
                    FROM (
                        SELECT
                            tech,
                            JSONB_BUILD_OBJECT(
                                'count', COUNT(tr.id),
                                'maximum_active_power', JSONB_BUILD_OBJECT(
                                    'sum', COALESCE(
                                        SUM(tr.maximum_active_power), 0
                                    ),
                                    'average', COALESCE(
                                        AVG(tr.maximum_active_power), 0
                                    ),
                                    'min', MIN(tr.maximum_active_power),
                                    'max', MAX(tr.maximum_active_power)
                                )
                            ) AS stats
                        -- all TRs currently in the SPG, grouped by technology
                        FROM flex.service_providing_group_membership AS spgm
                            LEFT JOIN flex.technical_resource AS tr
                                ON spgm.controllable_unit_id
                                    = tr.controllable_unit_id,
                            UNNEST(tr.technology) AS tech
                        WHERE spgm.service_providing_group_id = spg.id
                            AND spgm.valid_time_range @> current_timestamp
                        GROUP BY tech
                    ) AS tech_aggregates
                ),
                '{}'::jsonb
            )
        ) AS technical_resource,
        -- controllable unit aggregates
        JSONB_BUILD_OBJECT(
            -- all CU in the SPG
            'count', cu_aggregates.cu_count,
            'maximum_active_power', JSONB_BUILD_OBJECT(
                'sum', cu_aggregates.cu_sum_map,
                'average', cu_aggregates.cu_avg_map,
                'min', cu_aggregates.cu_min_map,
                'max', cu_aggregates.cu_max_map
            )
        ) AS controllable_unit
    FROM flex.service_providing_group AS spg
        -- Here if we left join SPG memberships (CUs) and TRs in order to
        -- compute aggregates, we get one line per TR, which means we can no
        -- longer compute aggregates at the CU-level.
        -- Instead, we use lateral left joins so aggregates are independent.
        LEFT JOIN LATERAL ( -- CU-level aggregates
            SELECT
                COUNT(*) AS cu_count,
                COALESCE(SUM(cu_map), 0) AS cu_sum_map,
                COALESCE(AVG(cu_map), 0) AS cu_avg_map,
                MIN(cu_map) AS cu_min_map,
                MAX(cu_map) AS cu_max_map
            FROM (
                -- MAP of CU = sum of MAP of all TRs in the CU
                -- the MAP field on CU is not only technical information
                -- (cf discount) so we do not use that field here
                SELECT COALESCE(SUM(tr.maximum_active_power), 0) AS cu_map
                FROM flex.service_providing_group_membership AS spgm
                    LEFT JOIN flex.technical_resource AS tr
                        ON spgm.controllable_unit_id = tr.controllable_unit_id
                WHERE spgm.service_providing_group_id = spg.id
                    AND spgm.valid_time_range @> current_timestamp
                GROUP BY spgm.controllable_unit_id
            ) AS cu_aggregates
        ) AS cu_aggregates ON TRUE
        LEFT JOIN LATERAL ( -- TR-level aggregates
            SELECT
                COUNT(tr.id) AS tr_count,
                COALESCE(SUM(tr.maximum_active_power), 0) AS tr_sum_map,
                COALESCE(AVG(tr.maximum_active_power), 0) AS tr_avg_map,
                MIN(tr.maximum_active_power) AS tr_min_map,
                MAX(tr.maximum_active_power) AS tr_max_map
            FROM flex.service_providing_group_membership AS spgm
                LEFT JOIN flex.technical_resource AS tr
                    ON spgm.controllable_unit_id = tr.controllable_unit_id
            WHERE spgm.service_providing_group_id = spg.id
                AND spgm.valid_time_range @> current_timestamp
        ) AS tr_aggregates ON TRUE
);

-- changeset flex:service-providing-group-summary-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_summary TO flex_common;
