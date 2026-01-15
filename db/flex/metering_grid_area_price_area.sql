--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-price-area-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS metering_grid_area_price_area (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metering_grid_area_id bigint NOT NULL,
    price_area text NOT NULL CHECK (
        price_area IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
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

    CONSTRAINT mgapa_metering_grid_area_fkey
    FOREIGN KEY (metering_grid_area_id) REFERENCES metering_grid_area (id)
);
