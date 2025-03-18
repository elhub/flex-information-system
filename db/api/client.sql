-- Manually managed file

CREATE OR REPLACE VIEW client
WITH (security_invoker = true) AS (
    SELECT
        id,
        entity_id,
        client_id,
        public_key,
        '***************' AS secret,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.client
);

CREATE OR REPLACE FUNCTION client_modify()
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

        INSERT INTO flex.client (entity_id, client_id, public_key, secret)
        VALUES (NEW.entity_id, NEW.client_id, NEW.public_key, NEW.secret)
        RETURNING id INTO l_id;

        SELECT * INTO l_new FROM api.client WHERE id = l_id;
        RETURN l_new;

    ELSIF TG_OP = 'UPDATE' THEN

        UPDATE flex.client SET
            client_id = NEW.client_id,
            public_key = NEW.public_key,
            secret = NEW.secret
        WHERE id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
            RETURN null;
        END IF;

        SELECT * INTO l_new FROM api.client WHERE id = NEW.id;
        RETURN l_new;

    ELSIF TG_OP = 'DELETE' THEN

        DELETE FROM flex.client WHERE id = OLD.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' USING
                message = 'Unauthorized';
        END IF;

        RETURN OLD;

    END IF;

    RETURN null;
END;
$$;

CREATE OR REPLACE TRIGGER client_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON client
FOR EACH ROW
EXECUTE FUNCTION client_modify();
