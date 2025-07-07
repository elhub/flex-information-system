--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-technical-resource-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.technical_resource_history
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

-- changeset flex:api-technical-resource-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.technical_resource
WITH (security_invoker = true) AS (
    SELECT
        trh.id,
        trh.controllable_unit_id,
        trh.details,
        trh.name,
        trh.recorded_by,
        lower(trh.record_time_range) AS recorded_at
    FROM (
        SELECT
            id,
            controllable_unit_id,
            details,
            name,
            recorded_by,
            record_time_range
        FROM flex.technical_resource
        UNION ALL
        SELECT
            id,
            controllable_unit_id,
            details,
            name,
            recorded_by,
            record_time_range
        FROM flex.technical_resource_history
    ) AS trh
        LEFT JOIN flex.controllable_unit_as_of AS cu_asof
            ON trh.controllable_unit_id = cu_asof.controllable_unit_id
                AND cu_asof.party_role = current_role
                AND cu_asof.party_id = flex.current_party()
    WHERE trh.record_time_range @> coalesce(cu_asof.as_of, current_timestamp)
);

-- changeset flex:api-technical-resource-modify-function endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION api.technical_resource_modify()
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
                    AND service_provider_id = (SELECT flex.current_party())
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
        RETURN l_new;

	ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.technical_resource
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

-- changeset flex:api-technical-resource-modify-trigger endDelimiter:-- runAlways:true
CREATE OR REPLACE TRIGGER technical_resource_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON api.technical_resource
FOR EACH ROW
EXECUTE FUNCTION api.technical_resource_modify();
