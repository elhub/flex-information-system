--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-metering-grid-area-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.metering_grid_area
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        'eic_y' AS business_id_type,
        name,
        status
    FROM flex.metering_grid_area
);
