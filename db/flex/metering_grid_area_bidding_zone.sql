--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-bidding-zone-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS metering_grid_area_bidding_zone (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metering_grid_area_id bigint NOT NULL,
    bidding_zone text NOT NULL CHECK (
        bidding_zone IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
    ),
    valid_time_range tstzrange CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT mgabz_metering_grid_area_fkey
    FOREIGN KEY (metering_grid_area_id) REFERENCES metering_grid_area (id)
);
