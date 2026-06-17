--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-entity-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.entity
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id_type,
        name,
        type,
        recorded_by,
        CASE
            WHEN
                business_id_type = 'pid'
                THEN substring(business_id FROM 1 FOR 6) || '*****'
            ELSE business_id
        END AS business_id,
        lower(record_time_range) AS recorded_at
    FROM flex.entity
);

-- changeset flex:api-entity-modify-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION api.entity_modify()
RETURNS TRIGGER
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
DECLARE
    l_id bigint;
    l_new record;
BEGIN
    IF TG_OP = 'INSERT' THEN

        INSERT INTO flex.entity (
            name,
            type,
            business_id,
            business_id_type
        )
        VALUES (
            NEW.name,
            NEW.type,
            NEW.business_id,
            NEW.business_id_type
        )
        RETURNING id INTO l_id;

        SELECT * INTO l_new FROM api.entity WHERE id = l_id;
        RETURN l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        UPDATE flex.entity SET
            -- only name is allowed to be updated
            name = NEW.name
        WHERE id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
            RETURN null;
        END IF;

        SELECT * INTO l_new FROM api.entity WHERE id = NEW.id;
        RETURN l_new;

    ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.entity WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
        END IF;

        RETURN OLD;

    END IF;

    RETURN null;
END;
$$;

-- changeset flex:api-entity-modify-trigger endDelimiter:-- runOnChange:true
CREATE OR REPLACE TRIGGER entity_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON api.entity
FOR EACH ROW
EXECUTE FUNCTION api.entity_modify();
