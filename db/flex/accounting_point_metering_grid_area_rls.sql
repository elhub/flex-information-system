--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-metering-grid-area-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS accounting_point_metering_grid_area
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON accounting_point_metering_grid_area
TO flex_common;
CREATE POLICY "APMGA_INTERNAL_COMMON"
ON accounting_point_metering_grid_area
FOR SELECT
TO flex_common
USING ('data:read' IN (SELECT flex.current_scopes()));
