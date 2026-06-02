--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS metering_grid_area ENABLE ROW LEVEL SECURITY;

-- RLS: MGA-COM001
GRANT SELECT ON metering_grid_area TO flex_common;
DROP POLICY IF EXISTS "MGA_COM001" ON metering_grid_area;
CREATE POLICY "MGA_COM001" ON metering_grid_area
FOR SELECT
TO flex_common
USING (true);
