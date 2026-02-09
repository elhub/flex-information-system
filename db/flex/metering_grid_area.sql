--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area runAlways:true endDelimiter:--
CREATE TABLE IF NOT EXISTS metering_grid_area (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text UNIQUE NOT NULL,
    name text NOT NULL CHECK ((char_length(name) <= 128)),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT metering_grid_area_business_id_check
    CHECK (
        utils.validate_business_id(business_id, 'eic_y')
    )
);
