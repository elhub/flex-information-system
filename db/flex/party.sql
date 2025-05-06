CREATE TABLE IF NOT EXISTS party (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    -- PTY-VAL002
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
    -- PTY-VAL002
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
    -- PTY-VAL001
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

-- This trigger functions is used to ensure that the
-- role name exists in the database catalog tables
CREATE OR REPLACE FUNCTION
flex.check_role_exists() RETURNS trigger AS $$
begin
  if not exists (select 1 from pg_roles as r where r.rolname = new.role) then
    raise foreign_key_violation using message =
      'unknown database role: ' || new.role;
    return null;
  end if;
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS party_role_exists ON party;
CREATE CONSTRAINT TRIGGER party_role_exists
AFTER INSERT OR UPDATE ON flex.party
FOR EACH ROW
EXECUTE PROCEDURE flex.check_role_exists();

CREATE OR REPLACE TRIGGER party_event
AFTER INSERT OR UPDATE ON party
FOR EACH ROW
EXECUTE FUNCTION capture_event('party');
