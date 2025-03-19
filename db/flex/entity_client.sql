CREATE TABLE IF NOT EXISTS entity_client (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    entity_id bigint NOT NULL REFERENCES entity (id),
    client_id uuid NOT NULL UNIQUE DEFAULT (public.uuid_generate_v4()),
    name text NULL CHECK (char_length(name) <= 64),
    client_secret text NULL,
    public_key text NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT check_public_key CHECK (
        public_key IS null
        OR public_key ~ '^-----BEGIN PUBLIC KEY-----\nMIIB[A-Za-z0-9+=\/\n]*\n-----END PUBLIC KEY-----$' -- noqa
    )
);

CREATE OR REPLACE FUNCTION entity_client_secret_crypt()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF
        (TG_OP = 'INSERT' AND NEW.client_secret IS NOT NULL) OR
        (TG_OP = 'UPDATE' AND
            NEW.client_secret IS DISTINCT FROM OLD.client_secret)
    THEN
        -- If the client secret is shorter than 12 characters, error
        IF char_length(NEW.client_secret) < 12 THEN
            RAISE EXCEPTION 'client secret must be at least 12 characters long';
        END IF;

        NEW.client_secret = public.crypt(
            NEW.client_secret, public.gen_salt('bf')
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER entity_client_secret_crypt
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW
EXECUTE FUNCTION entity_client_secret_crypt();
