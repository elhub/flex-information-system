-- Manually managed file

CREATE OR REPLACE VIEW entity
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        client_id,
        client_public_key,
        '***************' AS client_secret,
        name,
        type
    FROM flex.entity
);

CREATE OR REPLACE FUNCTION entity_modify()
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

        RETURN NULL;

    ELSIF TG_OP = 'UPDATE' THEN

        UPDATE flex.entity SET
            business_id = NEW.business_id,
            business_id_type = NEW.business_id_type,
            client_id = NEW.client_id,
            client_public_key = NEW.client_public_key,
            client_secret = NEW.client_secret,
            name = NEW.name,
            type = NEW.type
        where id = NEW.id;

        IF NOT FOUND THEN
            RAISE sqlstate 'PT401' using
                message = 'Unauthorized';
            RETURN null;
        END IF;

        select * into l_new from api.entity where id = NEW.id;

        return l_new;

	ELSIF TG_OP = 'DELETE' THEN

        RETURN NULL;

    END IF;

    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER entity_modify_trg
INSTEAD OF INSERT OR UPDATE OR DELETE
ON entity
FOR EACH ROW
EXECUTE FUNCTION entity_modify();
