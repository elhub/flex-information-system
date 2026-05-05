--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-metering-grid-area-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_metering_grid_area
WITH (security_invoker = false, security_barrier = true) AS (
    -- RLS: APMGA-FISO001
    SELECT
        ap_mga.accounting_point_id,
        ap_mga.metering_grid_area_id,
        lower(ap_mga.valid_time_range) AS valid_from,
        upper(ap_mga.valid_time_range) AS valid_to
    FROM flex.accounting_point_metering_grid_area AS ap_mga
        INNER JOIN flex.metering_grid_area AS mga
            ON
                ap_mga.metering_grid_area_id = mga.id
                AND mga.status = 'active'
    WHERE current_role = 'flex_flexibility_information_system_operator'
);
