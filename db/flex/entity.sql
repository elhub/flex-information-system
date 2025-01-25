-- Entity

CREATE TABLE IF NOT EXISTS entity (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    type text NOT NULL,
    business_id text NOT NULL,
    business_id_type text NOT NULL REFERENCES business_id_type (name),
    client_id text NOT NULL,
    client_secret text NULL,
    client_public_key text NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT check_entity_name_length CHECK (
        (char_length(name) <= 128)
    ),
    CONSTRAINT check_entity_type CHECK (
        type IN ('person', 'organisation')
    ),
    CONSTRAINT check_identity_business_id CHECK (
        char_length(business_id) <= 128
        AND validate_business_id(business_id, business_id_type)
    ),
    CONSTRAINT check_public_key CHECK (
        client_public_key IS null
        OR client_public_key ~ '^-----BEGIN PUBLIC KEY-----\nMIIB[A-Za-z0-9+=\/\n]*\n-----END PUBLIC KEY-----$' -- noqa
    )
);

COMMENT ON TABLE entity IS 'A legal or natural person.';

CREATE OR REPLACE FUNCTION entity_client_secret_crypt()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
DECLARE
    system_operator_id bigint;
BEGIN
    IF
        (TG_OP = 'INSERT' AND NEW.client_secret IS NOT NULL) OR
        (TG_OP = 'UPDATE' AND
            NEW.client_secret IS DISTINCT FROM OLD.client_secret)
    THEN
        -- If the client_secret is shorter than 12 character, error
        IF char_length(NEW.client_secret) < 12 THEN
            RAISE EXCEPTION 'client_secret must be at least 12 characters';
        END IF;

        NEW.client_secret = public.crypt(
            NEW.client_secret,
            public.gen_salt('bf')
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER entity_client_secret_crypt
BEFORE INSERT OR UPDATE ON entity
FOR EACH ROW
EXECUTE FUNCTION entity_client_secret_crypt();
