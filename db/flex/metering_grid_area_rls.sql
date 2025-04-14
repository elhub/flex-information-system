ALTER TABLE IF EXISTS metering_grid_area
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON metering_grid_area
TO flex_common;
