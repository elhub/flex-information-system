-- Manually managed file

CREATE OR REPLACE VIEW technical_resource_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS technical_resource_id,
        controllable_unit_id,
        details,
        name,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.technical_resource
    UNION ALL
    SELECT
        history_id AS id,
        id AS technical_resource_id,
        controllable_unit_id,
        details,
        name,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.technical_resource_history
);

CREATE OR REPLACE VIEW technical_resource
WITH (security_invoker = true) AS (
    SELECT
        tr.technical_resource_id AS id,
        tr.controllable_unit_id,
        tr.details,
        tr.name,
        tr.recorded_by,
        tr.recorded_at
    FROM (
        SELECT
            trh.*,
            row_number()
                OVER (
                    PARTITION BY trh.technical_resource_id
                    ORDER BY trh.recorded_at DESC
                )
            AS rn
        FROM api.technical_resource_history AS trh
    ) AS tr
    WHERE tr.rn = 1
);

CREATE OR REPLACE FUNCTION technical_resource_modify()
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

        INSERT INTO flex.technical_resource(
            controllable_unit_id,
            details,
            name
        ) VALUES (
            NEW.controllable_unit_id,
            NEW.details,
            NEW.name
        ) RETURNING id INTO l_id;

        SELECT * INTO l_new FROM api.technical_resource WHERE id = l_id;

        RETURN l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        SELECT
            tr.id,
            tr.controllable_unit_id,
            tr.details,
            tr.name,
            tr.recorded_by,
            lower(tr.record_time_range) AS recorded_at
        INTO l_old
        FROM flex.technical_resource AS tr;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' using
                    message = 'Unauthorized';
            RETURN null;
        END IF;

        IF l_old IS NOT DISTINCT FROM NEW THEN
            RETURN l_old;
        END IF;

        UPDATE flex.technical_resource SET
            controllable_unit_id = NEW.controllable_unit_id,
            details = NEW.details,
            name = NEW.name
        WHERE id = NEW.id;

        IF NOT FOUND THEN
            IF current_role = 'flex_service_provider'
                AND NOT EXISTS (
                    SELECT 1
                    FROM flex.controllable_unit_service_provider
                    WHERE controllable_unit_id = NEW.controllable_unit_id
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

        SELECT * INTO l_new FROM api.technical_resource WHERE id = NEW.id;
        return l_new;

	ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.technical_resource
	    WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' using
                message = 'Unauthorized';
            RETURN null;
        END IF;

        RETURN NULL;

    END IF;

    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER technical_resource_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON technical_resource
FOR EACH ROW
EXECUTE FUNCTION technical_resource_modify();
