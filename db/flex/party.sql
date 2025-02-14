CREATE TABLE IF NOT EXISTS party (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- PTY-IFV002
    business_id text UNIQUE NOT NULL DEFAULT (public.uuid_generate_v4()),
    business_id_type text NOT NULL
    REFERENCES business_id_type (name) DEFAULT 'uuid',
    entity_id bigint NOT NULL
    REFERENCES entity (id),
    name text NOT NULL,
    type text NOT NULL,
    role name NOT NULL,
    status text NOT NULL DEFAULT 'new' CHECK (
        status IN (
            'new',
            'active',
            'inactive',
            'suspended',
            'terminated'
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT check_party_name_length CHECK (
        (char_length(name) <= 128)
    ),
    -- PTY-IFV002
    CONSTRAINT check_party_business_id CHECK (
        char_length(business_id) <= 36
        AND validate_business_id(business_id, business_id_type)
    ),
    CONSTRAINT check_party_business_id_type CHECK (
        business_id_type IN (
            'gln',
            'uuid',
            'eic_x'
        )
    ),
    -- PTY-IFV001
    CONSTRAINT check_end_user_iff_uuid CHECK (
        (type = 'end_user' AND business_id_type = 'uuid')
        OR
        (type != 'end_user' AND business_id_type != 'uuid')
    ),
    CONSTRAINT check_party_type CHECK (
        type IN (
            'balance_responsible_party',
            'end_user',
            'energy_supplier',
            'flexibility_information_system_operator',
            'market_operator',
            'service_provider',
            'system_operator',
            'third_party'
        )
    ),
    CONSTRAINT uk_party_id_type UNIQUE (id, type)
);

-- only one end_user party per entity
CREATE INDEX IF NOT EXISTS uk_entity_end_user ON party (entity_id) WHERE (
    type = 'end_user'
);

DROP TRIGGER IF EXISTS party_role_exists ON party;
CREATE CONSTRAINT TRIGGER party_role_exists
AFTER INSERT OR UPDATE ON party
FOR EACH ROW
EXECUTE PROCEDURE check_role_exists();

CREATE OR REPLACE TRIGGER party_event
AFTER INSERT OR UPDATE ON party
FOR EACH ROW
EXECUTE FUNCTION capture_event('party');
