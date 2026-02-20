--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-create runOnChange:false endDelimiter:--
--validCheckSum: 9:be85821939083383802960279ec168af
CREATE TABLE IF NOT EXISTS controllable_unit (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id uuid UNIQUE NOT NULL DEFAULT (public.uuid_generate_v4()) CHECK (
        validate_business_id(business_id::text, 'uuid')
    ),
    name text NOT NULL CHECK ((char_length(name) <= 512)),
    start_date date NULL,
    status text NOT NULL DEFAULT 'new' CHECK (
        status IN (
            'new',
            'active',
            'inactive',
            'terminated'
        )
    ),
    regulation_direction text NOT NULL CHECK (
        regulation_direction IN ('up', 'down', 'both')
    ),
    maximum_active_power decimal(9, 3) NOT NULL,
    is_small boolean GENERATED ALWAYS AS (
        maximum_active_power <= 50
    ) STORED,
    minimum_duration bigint NULL CHECK (minimum_duration > 0),
    maximum_duration bigint NULL CHECK (maximum_duration > 0),
    recovery_duration bigint NULL CHECK (recovery_duration > 0),
    ramp_rate decimal(9, 3) NULL CHECK (ramp_rate > 0),
    accounting_point_id bigint NOT NULL,
    grid_node_id uuid NULL CHECK (
        grid_node_id IS NULL OR validate_business_id(grid_node_id::text, 'uuid')
    ),
    grid_validation_status text NOT NULL DEFAULT 'pending' CHECK (
        grid_validation_status IN (
            'pending',
            'in_progress',
            'incomplete_information',
            'validated',
            'validation_failed'
        )
    ),
    grid_validation_notes text NULL CHECK (
        char_length(grid_validation_notes) <= 512
    ),
    validated_at timestamp with time zone NULL,
    -- created_by_party_id is used to track the party that created the controllable unit.
    -- We use this in RLS policies to support the CU registration process - the party that creates the CU should be able to see it,
    -- even though they do not have a contract on the CU (yet).
    created_by_party_id bigint DEFAULT current_party() NOT NULL,
    -- audit fields
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, NULL, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT controllable_unit_maximum_active_power_check CHECK (
        maximum_active_power >= 0
    ),
    CONSTRAINT controllable_unit_accounting_point_id_fkey FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id),
    -- CU-VAL001
    CONSTRAINT controllable_unit_duration_check CHECK (
        minimum_duration <= maximum_duration
    )
);

-- changeset flex:controllable-unit-suppress-redundant-updates-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER a_controllable_unit_suppress_redundant_updates
BEFORE UPDATE ON controllable_unit
FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();

-- changeset flex:controllable-unit-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_status_insert
BEFORE INSERT ON controllable_unit
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('new');

-- changeset flex:controllable-unit-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_status_update
BEFORE UPDATE OF status ON controllable_unit
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status.restrict_update('new');

-- changeset flex:controllable-unit-grid-validation-status-reset-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION controllable_unit_grid_validation_status_reset()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
BEGIN
    NEW.grid_validation_status := 'pending';
    RETURN NEW;
END;
$$;

-- changeset flex:controllable-unit-event-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_event
AFTER INSERT OR UPDATE ON controllable_unit
FOR EACH ROW
EXECUTE FUNCTION capture_event();

-- changeset flex:controllable-unit-check-timestamp-on-status-update runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_check_timestamp_on_status_update
BEFORE UPDATE ON controllable_unit
FOR EACH ROW
EXECUTE FUNCTION utils.check_timestamp_on_status_update(
    'validated_at', 'grid_validation_status',
    '{validated}',
    '{validation_failed}'
);

-- changeset flex:controllable-unit-status-check-technical-resources-on-activation-function runOnChange:true endDelimiter:--
-- CU-VAL004
CREATE OR REPLACE FUNCTION
controllable_unit_check_technical_resources_on_activation()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM flex.technical_resource AS tr
        WHERE tr.controllable_unit_id = NEW.id
    ) THEN
        RAISE EXCEPTION
            'Cannot activate controllable unit with no technical resources.';
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:controllable-unit-status-check-technical-resources-on-activation-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_status_check_technical_resources_on_activation
AFTER UPDATE ON controllable_unit
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'active') -- noqa
EXECUTE FUNCTION controllable_unit_check_technical_resources_on_activation();
