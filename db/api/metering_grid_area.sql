--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-metering-grid-area-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.metering_grid_area
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        name
    FROM flex.metering_grid_area
);
