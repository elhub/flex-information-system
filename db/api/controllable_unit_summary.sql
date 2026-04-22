--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-controllable-unit-summary-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.controllable_unit_summary
WITH (security_invoker = true) AS (
    -- RLS: CUSU-COM001
    SELECT
        cusu.id,
        cusu.count_technical_resource,
        cusu.count_technical_resource_by_technology,
        cusu.sum_maximum_active_power,
        cusu.sum_maximum_active_power_production,
        cusu.sum_maximum_active_power_consumption,
        cusu.sum_maximum_active_power_energy_storage,
        cusu.average_maximum_active_power
    FROM flex.controllable_unit_summary AS cusu
    WHERE
        EXISTS (
            SELECT 1
            FROM flex.controllable_unit AS cu
            WHERE cu.id = cusu.id
        )
);
