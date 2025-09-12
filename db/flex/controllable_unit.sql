--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-create runOnChange:false endDelimiter:--
--validCheckSum: 9:054c5c4905551cea0bb2299fd88b8fdf
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
            'suspended',
            'terminated'
        )
    ),
    regulation_direction text NOT NULL CHECK (
        regulation_direction IN ('up', 'down', 'both')
    ),
    maximum_available_capacity decimal(9, 3) NOT NULL CHECK (
        maximum_available_capacity >= 0
    ),
    is_small boolean GENERATED ALWAYS AS (
        maximum_available_capacity <= 50
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
    last_validated timestamp with time zone NULL,
    -- created_by_party_id is used to track the party that created the controllable unit.
    -- We use this in RLS policies to support the CU registration process - the party that creates the CU should be able to see it,
    -- even though they do not have a contract on the CU (yet).
    created_by_party_id bigint DEFAULT current_party() NOT NULL,
    -- audit fields
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, NULL, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

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

-- changeset flex:controllable-unit-grid-validation-status-approved-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION controllable_unit_grid_validation_status_approved()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.last_validated := current_timestamp;
    RETURN NEW;
END;
$$;

-- changeset flex:controllable-unit-grid-validation-status-approved-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_grid_validation_status_approved
BEFORE UPDATE OF grid_validation_status ON controllable_unit
FOR EACH ROW
WHEN (
    OLD.grid_validation_status IS DISTINCT FROM NEW.grid_validation_status -- noqa
    AND NEW.grid_validation_status = 'approved' -- noqa
    AND OLD.last_validated IS NULL AND NEW.last_validated IS NULL -- noqa
)
EXECUTE FUNCTION controllable_unit_grid_validation_status_approved();

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

-- changeset flex:controllable-unit-grid-validation-status-reset-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_grid_validation_status_reset
BEFORE UPDATE OF
regulation_direction,
maximum_available_capacity,
minimum_duration,
maximum_duration,
recovery_duration,
ramp_rate,
accounting_point_id
ON controllable_unit
FOR EACH ROW
WHEN (
    OLD.grid_validation_status IS NOT DISTINCT FROM NEW.grid_validation_status -- noqa
    AND NEW.grid_validation_status not in ('pending', 'in_progress','validated') -- noqa
    AND current_user = 'flex_service_provider' -- noqa
)
EXECUTE FUNCTION controllable_unit_grid_validation_status_reset();

-- changeset flex:controllable-unit-event-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_event
AFTER INSERT OR UPDATE ON controllable_unit
FOR EACH ROW
EXECUTE FUNCTION capture_event('controllable_unit');
