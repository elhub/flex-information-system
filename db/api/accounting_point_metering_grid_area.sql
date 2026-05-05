--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-metering-grid-area-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_metering_grid_area
WITH (security_invoker = false, security_barrier = true) AS (
    -- RLS: APMGA-FISO001
    SELECT
        accounting_point_id,
        metering_grid_area_id,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_metering_grid_area
    WHERE current_role = 'flex_flexibility_information_system_operator'
);
