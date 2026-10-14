--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-client runOnChange:false endDelimiter:--
-- validCheckSum: 9:0e0ac95e8b5c61cba271b9601f08abab
CREATE TABLE IF NOT EXISTS entity_client (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    entity_id bigint NOT NULL REFERENCES entity (id),
    client_id uuid NOT NULL UNIQUE DEFAULT (public.uuid_generate_v4()),
    party_id bigint NULL,
    scopes flex.scope[] NOT NULL,
    name text NULL CHECK (char_length(name) <= 256), -- noqa: RF04
    -- deprecated: client_credentials was removed, this column is kept but unused
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
