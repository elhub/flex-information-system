--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:controllable-unit-summary-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_summary
WITH (security_invoker = false) AS (
    SELECT
        cu.id,
        JSONB_BUILD_OBJECT(
            -- general TR aggregates
            'count', COUNT(tr1.id),
            'maximum_active_power', JSONB_BUILD_OBJECT(
                'sum', COALESCE(SUM(tr1.maximum_active_power), 0),
                'average', COALESCE(AVG(tr1.maximum_active_power), 0),
                'min', MIN(tr1.maximum_active_power),
                'max', MAX(tr1.maximum_active_power)
            ),
            -- same computation filtered for each category
            'by_category', COALESCE(
                (
                    SELECT JSONB_OBJECT_AGG(cat, stats)
                    FROM (
                        SELECT
                            cat,
                            JSONB_BUILD_OBJECT(
                                'count', COUNT(tr2.id),
                                'maximum_active_power', JSONB_BUILD_OBJECT(
                                    'sum', COALESCE(
                                        SUM(tr2.maximum_active_power), 0
                                    ),
                                    'average', COALESCE(
                                        AVG(tr2.maximum_active_power), 0
                                    ),
                                    'min', MIN(tr2.maximum_active_power),
                                    'max', MAX(tr2.maximum_active_power)
                                )
                            ) AS stats
                        FROM flex.technical_resource AS tr2,
                            UNNEST(tr2.category) AS cat
                        WHERE tr2.controllable_unit_id = cu.id
                        GROUP BY cat
                    ) AS cat_aggregates
                ),
                '{}'::jsonb
            ),
            -- same computation filtered for each technology
            'by_technology', COALESCE(
                (
                    SELECT JSONB_OBJECT_AGG(tech, stats)
                    FROM (
                        SELECT
                            tech,
                            JSONB_BUILD_OBJECT(
                                'count', COUNT(tr3.id),
                                'maximum_active_power', JSONB_BUILD_OBJECT(
                                    'sum', COALESCE(
                                        SUM(tr3.maximum_active_power), 0
                                    ),
                                    'average', COALESCE(
                                        AVG(tr3.maximum_active_power), 0
                                    ),
                                    'min', MIN(tr3.maximum_active_power),
                                    'max', MAX(tr3.maximum_active_power)
                                )
                            ) AS stats
                        FROM flex.technical_resource AS tr3,
                            UNNEST(tr3.technology) AS tech
                        WHERE tr3.controllable_unit_id = cu.id
                        GROUP BY tech
                    ) AS tech_aggregates
                ),
                '{}'::jsonb
            )
        ) AS technical_resource
    FROM flex.controllable_unit AS cu
        -- left join so we still get data with zero values for empty CUs
        LEFT JOIN flex.technical_resource AS tr1
            ON cu.id = tr1.controllable_unit_id
    GROUP BY cu.id
);

-- changeset flex:controllable-unit-summary-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_summary TO flex_common;
