-- The accounting point table is purpose is to store information about accounting points from the Elhub system.
CREATE TABLE IF NOT EXISTS accounting_point (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text UNIQUE NOT NULL CHECK (
        validate_business_id(business_id, 'gsrn')
    ),
    metering_grid_area_id bigint NOT NULL,
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_accounting_point_metering_grid_area FOREIGN KEY (
        metering_grid_area_id
    ) REFERENCES metering_grid_area (id),
    CONSTRAINT fk_accounting_point_system_operator FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type)
);
