--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area runOnChange:false endDelimiter:--
-- validCheckSum: 9:69f04f17e0a84326f6a6eddd29777f01
CREATE TABLE IF NOT EXISTS metering_grid_area (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text UNIQUE NOT NULL,
    name text NOT NULL CHECK ((char_length(name) <= 128)),
    price_area text NOT NULL CHECK (
        price_area IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
    ),
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
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

    CONSTRAINT metering_grid_area_business_id_check
    CHECK (
        validate_business_id(business_id, 'eic_x')
    ),
    CONSTRAINT metering_grid_area_system_operator_fkey
    FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type)
);
