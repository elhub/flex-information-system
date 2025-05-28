--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-controllable-unit-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.controllable_unit_history WITH (
    security_invoker = true
) AS (
    SELECT
        cu.id,
        cu.id AS controllable_unit_id,
        cu.accounting_point_id,
        cu.business_id,
        cu.grid_node_id,
        cu.grid_validation_notes,
        cu.grid_validation_status,
        cu.last_validated,
        cu.maximum_available_capacity,
        cu.is_small,
        cu.maximum_duration,
        cu.minimum_duration,
        cu.name,
        cu.ramp_rate,
        cu.recovery_duration,
        cu.regulation_direction,
        cu.start_date,
        cu.status,
        cu.recorded_by,
        lower(cu.record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.controllable_unit AS cu
    UNION ALL
    SELECT
        cu.history_id AS id,
        cu.id AS controllable_unit_id,
        cu.accounting_point_id,
        cu.business_id,
        cu.grid_node_id,
        cu.grid_validation_notes,
        cu.grid_validation_status,
        cu.last_validated,
        cu.maximum_available_capacity,
        cu.is_small,
        cu.maximum_duration,
        cu.minimum_duration,
        cu.name,
        cu.ramp_rate,
        cu.recovery_duration,
        cu.regulation_direction,
        cu.start_date,
        cu.status,
        cu.recorded_by,
        lower(cu.record_time_range) AS recorded_at,
        cu.replaced_by,
        upper(cu.record_time_range) AS replaced_at
    FROM flex.controllable_unit_history AS cu
);

-- changeset flex:api-controllable-unit-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.controllable_unit
WITH (security_invoker = true) AS (
    SELECT
        cu.controllable_unit_id AS id,
        cu.accounting_point_id,
        cu.business_id,
        cu.grid_node_id,
        cu.grid_validation_notes,
        cu.grid_validation_status,
        cu.last_validated,
        cu.maximum_available_capacity,
        cu.is_small,
        cu.maximum_duration,
        cu.minimum_duration,
        cu.name,
        cu.ramp_rate,
        cu.recovery_duration,
        cu.regulation_direction,
        cu.start_date,
        cu.status,
        cu.recorded_by,
        cu.recorded_at
    FROM (

        /* Since data access on CU is time-dependent, we need to pick the latest
        version that the user has access to. RLA policies on _history tables
        will ensure that the user only sees what they are allowed to see. The
        window function will then show the latest. */

        SELECT
            cuh.*, -- noqa
            row_number()
                OVER (
                    PARTITION BY cuh.controllable_unit_id
                    ORDER BY cuh.recorded_at DESC
                )
            AS rn
        FROM api.controllable_unit_history AS cuh
    ) AS cu
    WHERE cu.rn = 1
);

-- changeset flex:api-controllable-unit-grid-validation-status-default endDelimiter:-- runAlways:true
ALTER VIEW IF EXISTS api.controllable_unit
ALTER COLUMN grid_validation_status SET DEFAULT 'pending';

-- changeset flex:api-controllable-unit-status-default endDelimiter:-- runAlways:true
ALTER VIEW IF EXISTS api.controllable_unit
ALTER COLUMN status SET DEFAULT 'new';

-- changeset flex:api-controllable-unit-modify-function endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION api.controllable_unit_modify()
RETURNS TRIGGER
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_id bigint;
    l_new record;
    l_old record;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO flex.controllable_unit(
            accounting_point_id,
            grid_node_id,
            grid_validation_notes,
            grid_validation_status,
            last_validated,
            maximum_available_capacity,
            maximum_duration,
            minimum_duration,
            name,
            ramp_rate,
            recovery_duration,
            regulation_direction,
            start_date,
            status )
        VALUES (
            NEW.accounting_point_id,
            NEW.grid_node_id,
            NEW.grid_validation_notes,
            NEW.grid_validation_status,
            NEW.last_validated,
            NEW.maximum_available_capacity,
            NEW.maximum_duration,
            NEW.minimum_duration,
            NEW.name,
            NEW.ramp_rate,
            NEW.recovery_duration,
            NEW.regulation_direction,
            NEW.start_date,
            NEW.status
        ) RETURNING id INTO l_id;

        select * into l_new from api.controllable_unit where id = l_id;

        return l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        -- according to https://www.postgresql.org/message-id/20110509131717.1370e36f%40dick.coachhouse
        -- PostgreSQL might be clever and not do any update when there is no change in NEW
        -- This means that using FOUND is unreliable and we need to handle this case ourselves
        SELECT
            cu.id,
            cu.accounting_point_id,
            cu.business_id,
            cu.grid_node_id,
            cu.grid_validation_notes,
            cu.grid_validation_status,
            cu.last_validated,
            cu.maximum_available_capacity,
            cu.is_small,
            cu.maximum_duration,
            cu.minimum_duration,
            cu.name,
            cu.ramp_rate,
            cu.recovery_duration,
            cu.regulation_direction,
            cu.start_date,
            cu.status,
            cu.recorded_by,
            lower(cu.record_time_range) AS recorded_at
        FROM flex.controllable_unit INTO l_old AS cu
        WHERE cu.id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' using
                    message = 'Unauthorized';
            RETURN null;
        END IF;

        IF l_old is not distinct from NEW THEN
            RETURN l_old;
        END IF;

        -- check done - we should try an update

        UPDATE flex.controllable_unit SET
            accounting_point_id = NEW.accounting_point_id,
            business_id = NEW.business_id,
            grid_node_id = NEW.grid_node_id,
            grid_validation_notes = NEW.grid_validation_notes,
            grid_validation_status = NEW.grid_validation_status,
            last_validated = NEW.last_validated,
            maximum_available_capacity = NEW.maximum_available_capacity,
            maximum_duration = NEW.maximum_duration,
            minimum_duration = NEW.minimum_duration,
            name = NEW.name,
            ramp_rate = NEW.ramp_rate,
            recovery_duration = NEW.recovery_duration,
            regulation_direction = NEW.regulation_direction,
            start_date = NEW.start_date,
            status = NEW.status
        where id = NEW.id;


        IF NOT FOUND THEN
            IF current_role = 'flex_service_provider'
                AND NOT EXISTS (
                    SELECT 1
                    FROM flex.controllable_unit_service_provider
                    WHERE controllable_unit_id = NEW.id
                    AND service_provider_id = flex.current_party()
                    AND valid_time_range @> current_timestamp
                )
            THEN
                RAISE sqlstate 'PT401' using
                    message = 'Unauthorized: service provider is not responsible for the controllable unit';
            ELSE
                RAISE sqlstate 'PT401' using
                    message = 'Unauthorized';
            END IF;
            RETURN null;
        END IF;

        select * into l_new from api.controllable_unit where id = NEW.id;

        return l_new;

	ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.controllable_unit
	    WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' using
                message = 'Unauthorized';
            RETURN null;
        END IF;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

-- changeset flex:api-controllable-unit-modify-trigger endDelimiter:-- runAlways:true
CREATE OR REPLACE TRIGGER controllable_unit_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON api.controllable_unit
FOR EACH ROW
EXECUTE FUNCTION api.controllable_unit_modify();
