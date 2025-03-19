-- Manually managed file

CREATE OR REPLACE VIEW entity_client
WITH (security_invoker = true) AS (
    SELECT
        id,
        entity_id,
        client_id,
        name,
        public_key,
        '***************' AS client_secret,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.entity_client
);

CREATE OR REPLACE FUNCTION entity_client_modify()
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

        INSERT INTO flex.entity_client (
            entity_id,
            name,
            public_key,
            client_secret
        )
        VALUES (
            NEW.entity_id,
            NEW.name,
            NEW.public_key,
            NEW.client_secret
        )
        RETURNING id INTO l_id;

        SELECT * INTO l_new FROM api.entity_client WHERE id = l_id;
        RETURN l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        UPDATE flex.entity_client SET
            client_id = NEW.client_id,
            name = NEW.name,
            public_key = NEW.public_key,
            client_secret = NEW.client_secret
        WHERE id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
            RETURN null;
        END IF;

        SELECT * INTO l_new FROM api.entity_client WHERE id = NEW.id;
        RETURN l_new;

    ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.entity_client WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
        END IF;

        RETURN OLD;

    END IF;

    RETURN null;
END;
$$;

CREATE OR REPLACE TRIGGER entity_client_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON entity_client
FOR EACH ROW
EXECUTE FUNCTION entity_client_modify();
