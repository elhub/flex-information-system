--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-system-operator-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS metering_grid_area_system_operator (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    metering_grid_area_id bigint NOT NULL,
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

    CONSTRAINT mgabz_metering_grid_area_fkey
    FOREIGN KEY (metering_grid_area_id) REFERENCES metering_grid_area (id),
    CONSTRAINT metering_grid_area_system_operator_fkey
    FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type)
);
