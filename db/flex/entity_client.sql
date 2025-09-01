--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client runOnChange:false endDelimiter:--
-- validCheckSum: 9:0e0ac95e8b5c61cba271b9601f08abab
CREATE TABLE IF NOT EXISTS entity_client (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    entity_id bigint NOT NULL REFERENCES entity (id),
    client_id uuid NOT NULL UNIQUE DEFAULT (public.uuid_generate_v4()),
    party_id bigint NULL,
    scopes flex.scope [] NOT NULL,
    name text NULL CHECK (char_length(name) <= 256),
    client_secret text NULL,
    public_key text NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT check_public_key CHECK (
        public_key IS null
        OR public_key ~ '^-----BEGIN PUBLIC KEY-----\nMIIB[A-Za-z0-9+=\/\n]*\n-----END PUBLIC KEY-----$' -- noqa
    ),
    CONSTRAINT fk_entity_client_party_id FOREIGN KEY (party_id)
    REFERENCES party (id),
    CONSTRAINT check_scopes_not_empty CHECK (
        array_length(scopes, 1) > 0
    )
);

-- changeset flex:entity-client-secret-crypt-function runOnChange:true endDelimiter:--
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

-- changeset flex:entity-client-secret-crypt-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER entity_client_secret_crypt
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW
EXECUTE FUNCTION entity_client_secret_crypt();

-- changeset flex:entity-client-check-assumable-party-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION entity_client_check_assumable_party()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT (
        -- entity is member of party
        EXISTS (
            SELECT 1 FROM flex.party_membership AS pm
            WHERE pm.entity_id = NEW.entity_id AND pm.party_id = NEW.party_id
        )
        -- entity owns party
        OR EXISTS (
            SELECT 1 FROM flex.party AS p
            WHERE p.id = NEW.party_id AND p.entity_id = NEW.entity_id
        )
    ) THEN
        RAISE EXCEPTION 'entity cannot assume the chosen party';
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:entity-client-check-assumable-party-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER entity_client_check_assumable_party
BEFORE UPDATE ON entity_client
FOR EACH ROW
WHEN (new.party_id IS NOT null)
EXECUTE FUNCTION entity_client_check_assumable_party();
