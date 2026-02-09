--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-create runOnChange:false endDelimiter:--
--validCheckSum: 9:65fc6f6a36ea85af1b3dcb1e11a78ec2
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
            'eic_x',
            'org'
        )
    ),
    -- PTY-VAL001
    CONSTRAINT check_end_user_iff_uuid CHECK (
        (type = 'end_user' AND business_id_type = 'uuid')
        OR
        (type != 'end_user' AND business_id_type != 'uuid')
    ),
    -- PTY-VAL003
    CONSTRAINT check_organisation_iff_org CHECK (
        (type = 'organisation' AND business_id_type = 'org')
        OR
        (type != 'organisation' AND business_id_type != 'org')
    ),
    CONSTRAINT check_party_type CHECK (
        type IN (
            'balance_responsible_party',
            'end_user',
            'energy_supplier',
            'flexibility_information_system_operator',
            'market_operator',
            'organisation',
            'service_provider',
            'system_operator',
            'third_party'
        )
    ),
    CONSTRAINT uk_party_id_type UNIQUE (id, type)
);

-- changeset flex:party-entiry-end-user-uk runOnChange:true endDelimiter:--
-- only one end_user party per entity
CREATE INDEX IF NOT EXISTS uk_entity_end_user ON party (entity_id) WHERE (
    type = 'end_user'
);

-- changeset flex:party-status-insert-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER party_status_insert
BEFORE INSERT ON flex.party
FOR EACH ROW
EXECUTE FUNCTION status.restrict_insert('new');

-- changeset flex:party-status-update-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER party_status_update
BEFORE UPDATE OF status ON flex.party
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status) -- noqa
EXECUTE FUNCTION status.restrict_update('new');

-- changeset flex:party-role-exists-trigger runOnChange:true endDelimiter:;
-- This trigger functions is used to ensure that the
-- role name exists in the database catalog tables
-- The drop is there because constraint triggers do not support IF NOT EXISTS
DROP TRIGGER IF EXISTS party_role_exists ON flex.party;
CREATE CONSTRAINT TRIGGER party_role_exists
AFTER INSERT OR UPDATE ON flex.party
FOR EACH ROW
EXECUTE PROCEDURE utils.role_exists();

-- changeset flex:party-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER party_event
AFTER INSERT OR UPDATE ON party
FOR EACH ROW
EXECUTE FUNCTION capture_event();

-- changeset flex:current-party-owner-create runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.current_party_owner()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT p.entity_id
    FROM flex.party AS p
    WHERE p.id = (SELECT flex.current_party())
$$;
