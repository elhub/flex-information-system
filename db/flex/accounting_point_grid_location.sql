--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-grid-location-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS accounting_point_grid_location (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    object_type text NOT NULL CHECK (
        object_type IN ('substation', 'transformer')
    ),
    business_id text,
    name text NOT NULL CHECK ((char_length(name) <= 512)),
    nominal_voltage numeric NOT NULL CHECK (nominal_voltage >= 0),
    additional_information text,
    source text NOT NULL CHECK (
        source IN ('cso', 'so', 'grid_model', 'system')
    ),
    quality text NOT NULL CHECK (
        quality IN ('confirmed', 'guessed')
    ),
    -- audit fields
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, NULL, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_accounting_point_grid_location_accounting_point FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id)
);

-- changeset flex:accounting-point-grid-location-suppress-redundant-updates-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER a_accounting_point_grid_location_suppress_redundant_updates
BEFORE UPDATE ON accounting_point_grid_location
FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();

-- changeset flex:accounting-point-grid-location-accounting-point-idx runOnChange:true endDelimiter:-- runInTransaction:false
CREATE INDEX CONCURRENTLY IF NOT EXISTS
accounting_point_grid_location_accounting_point_idx
ON accounting_point_grid_location (accounting_point_id);
