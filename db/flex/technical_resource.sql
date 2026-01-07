--liquibase formatted sql
-- Manually managed file

-- changeset flex:technical-resource-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS technical_resource (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    controllable_unit_id bigint NOT NULL,
    details text,

    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_technical_resource_controllable_unit_id FOREIGN KEY (
        controllable_unit_id
    ) REFERENCES controllable_unit (id),
    CONSTRAINT check_technical_resource_name_length CHECK (
        (char_length(name) <= 128)
    ),
    CONSTRAINT check_technical_resource_details_length CHECK (
        (char_length(details) <= 1024)
    )
);

-- changeset flex:technical-resource-suppress-redundant-updates runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER a_technical_resource_suppress_redundant_updates
BEFORE UPDATE ON technical_resource
FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();


-- changeset flex:technical-resource-grid-validation-status-reset-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION technical_resource_grid_validation_status_reset()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    lv_controllable_unit_id bigint;
BEGIN

    IF TG_OP = 'DELETE' THEN
        lv_controllable_unit_id := OLD.controllable_unit_id;
    ELSE
        lv_controllable_unit_id := NEW.controllable_unit_id;
    END IF;

    UPDATE controllable_unit
    SET grid_validation_status = 'pending',
        recorded_by = 0
    WHERE id = lv_controllable_unit_id
    AND grid_validation_status not in ('pending', 'in_progress','validated');

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- changeset flex:technical-resource-grid-validation-status-reset-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER technical_resource_grid_validation_status_reset
BEFORE UPDATE OF
details
ON technical_resource
FOR EACH ROW
WHEN (
    OLD.details IS DISTINCT FROM NEW.details -- noqa
    AND current_user = 'flex_service_provider' -- noqa
)
EXECUTE FUNCTION technical_resource_grid_validation_status_reset();

-- changeset flex:technical-resource-grid-validation-status-reset-trigger-on-add-remove runOnChange:true endDelimiter:--
CREATE OR REPLACE
TRIGGER technical_resource_grid_validation_status_reset_on_add_remove
BEFORE INSERT OR DELETE
ON technical_resource
FOR EACH ROW
WHEN (
    current_user = 'flex_service_provider' -- noqa
)
EXECUTE FUNCTION technical_resource_grid_validation_status_reset();


-- changeset flex:technical-resource-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER technical_resource_event
AFTER INSERT OR UPDATE OR DELETE ON technical_resource
FOR EACH ROW
EXECUTE FUNCTION capture_event('controllable_unit');
