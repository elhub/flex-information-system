--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-summary-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_summary
WITH (security_invoker = false) AS (
    SELECT
        cu.id,
        -- count technical resources (total and per technology)
        COUNT(tr.id) AS count_technical_resource,
        COALESCE(
            (
                -- technology and number of TR, as a {tech: count_tr} object
                -- NB: per-category aggregates can have their own field, but
                --     per-technology aggregates have many more possible keys
                SELECT JSONB_OBJECT_AGG(t.tech, t.count_tr)
                FROM (
                    SELECT
                        tech,
                        COUNT(DISTINCT tr2.id) AS count_tr -- noqa
                    FROM flex.technical_resource AS tr2,
                        UNNEST(tr2.technology) AS tech
                    WHERE tr2.controllable_unit_id = cu.id
                    GROUP BY tech
                ) AS t
            ),
            '{}'::jsonb
        ) AS count_technical_resource_by_technology,
        -- sum of TR MAP (total and per category)
        COALESCE(SUM(tr.maximum_active_power), 0) AS sum_maximum_active_power,
        COALESCE(
            SUM(tr.maximum_active_power) FILTER (
                WHERE 'production' = ANY(tr.category)
            ),
            0
        ) AS sum_maximum_active_power_production,
        COALESCE(
            SUM(tr.maximum_active_power) FILTER (
                WHERE 'consumption' = ANY(tr.category)
            ),
            0
        ) AS sum_maximum_active_power_consumption,
        COALESCE(
            SUM(tr.maximum_active_power) FILTER (
                WHERE 'energy_storage' = ANY(tr.category)
            ),
            0
        ) AS sum_maximum_active_power_energy_storage,
        -- average of TR MAP
        COALESCE(AVG(tr.maximum_active_power), 0)
            AS average_maximum_active_power -- noqa
    FROM flex.controllable_unit AS cu
        LEFT JOIN flex.technical_resource AS tr
            ON cu.id = tr.controllable_unit_id
    GROUP BY cu.id
);

-- changeset flex:controllable-unit-summary-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_summary TO flex_common;
