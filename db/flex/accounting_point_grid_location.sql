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
        ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
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

-- changeset flex:accounting-point-grid-location-source-set-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION accounting_point_grid_location_source_set()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF coalesce((SELECT current_party()),0) = 0 THEN
        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = NEW.accounting_point_id
            AND ap_so.system_operator_id = (SELECT current_party())
            AND ap_so.valid_time_range @> current_timestamp
    ) THEN
        NEW.source := 'cso';
    ELSE
        NEW.source := 'so';
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER a_accounting_point_grid_location_source_set
BEFORE INSERT OR UPDATE
ON accounting_point_grid_location
FOR EACH ROW
EXECUTE FUNCTION accounting_point_grid_location_source_set();

-- changeset flex:accounting-point-grid-location-source-transition-check-trigger runOnChange:true endDelimiter:--
-- APGL-VAL001
CREATE OR REPLACE FUNCTION accounting_point_grid_location_source_transition_check()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF OLD.source IS DISTINCT FROM NEW.source THEN
        IF NOT (
            CASE OLD.source
                WHEN 'grid_model' THEN NEW.source = 'grid_model'
                WHEN 'cso'        THEN NEW.source IN ('grid_model', 'cso')
                WHEN 'so'         THEN NEW.source IN ('grid_model', 'cso', 'so')
                WHEN 'system'     THEN NEW.source IN ('grid_model', 'cso', 'so', 'system')
            END
        ) THEN
            RAISE EXCEPTION
                'Invalid source transition from % to %.', OLD.source, NEW.source;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER b_accounting_point_grid_location_source_transition_check
BEFORE UPDATE ON accounting_point_grid_location
FOR EACH ROW
WHEN (current_role != 'flex_flexibility_information_system_operator')
EXECUTE FUNCTION accounting_point_grid_location_source_transition_check();

-- changeset flex:accounting-point-grid-location-quality-source-check-trigger runOnChange:true endDelimiter:--
-- APGL-VAL002
CREATE OR REPLACE FUNCTION accounting_point_grid_location_quality_source_check()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NEW.quality = 'confirmed' AND NEW.source NOT IN ('cso', 'so', 'grid_model') THEN
        RAISE EXCEPTION
            'quality=confirmed is not permitted with source=%.', NEW.source;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER b_accounting_point_grid_location_quality_source_check
BEFORE INSERT OR UPDATE ON accounting_point_grid_location
FOR EACH ROW
WHEN (current_role != 'flex_flexibility_information_system_operator')
EXECUTE FUNCTION accounting_point_grid_location_quality_source_check();

-- changeset flex:accounting-point-grid-location-event-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER z_accounting_point_grid_location_event
AFTER INSERT OR UPDATE ON accounting_point_grid_location
FOR EACH ROW
EXECUTE FUNCTION capture_event('accounting_point');
