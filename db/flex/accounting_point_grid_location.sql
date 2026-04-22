--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-grid-location-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS accounting_point_grid_location (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    object_type text NOT NULL,
    business_id text,
    name text NOT NULL,
    nominal_voltage decimal(9, 3) NOT NULL,
    additional_information text,
    source text NOT NULL,
    quality text NOT NULL,
    -- audit fields
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, NULL, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT accounting_point_grid_location_object_type_check CHECK (
        object_type IN ('substation', 'transformer')
    ),
    CONSTRAINT accounting_point_grid_location_business_id_check CHECK (
        business_id IS NULL
        OR business_id
        ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    ),
    CONSTRAINT accounting_point_grid_location_name_check CHECK (
        char_length(name) <= 512
    ),
    CONSTRAINT accounting_point_grid_location_nominal_voltage_check CHECK (
        nominal_voltage >= 0
    ),
    CONSTRAINT accounting_point_grid_location_source_check CHECK (
        source IN ('cso', 'so', 'grid_model', 'system')
    ),
    CONSTRAINT accounting_point_grid_location_quality_check CHECK (
        quality IN ('confirmed', 'guessed')
    ),

    CONSTRAINT fk_accounting_point_grid_location_accounting_point FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id)
);

-- changeset flex:accounting-point-grid-location-suppress-redundant-updates-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER a_accounting_point_grid_location_suppress_redundant_updates
BEFORE UPDATE ON accounting_point_grid_location
FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();

-- changeset flex:accounting-point-grid-location-accounting-point-idx runOnChange:true endDelimiter:-- runInTransaction:false
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS
accounting_point_grid_location_accounting_point_idx
ON accounting_point_grid_location (accounting_point_id);
