ALTER TABLE IF EXISTS balance_responsible_party_metering_grid_area
ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON balance_responsible_party_metering_grid_area
TO flex_common;
