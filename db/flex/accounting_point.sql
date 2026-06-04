--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-create runOnChange:false endDelimiter:--
--validCheckSum: 9:6af2a1e31014a67dfeee5eada0e8556f
-- The accounting point table is purpose is to store information about accounting points from the Elhub system.
CREATE TABLE IF NOT EXISTS accounting_point (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text UNIQUE NOT NULL CHECK (
        validate_business_id(business_id, 'gsrn')
    ),
    location geometry(Point, 4326) NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity()
);

-- changeset flex:accounting-point-location-index runOnChange:true endDelimiter:--
CREATE INDEX IF NOT EXISTS accounting_point_location_idx
ON accounting_point USING gist(location);
