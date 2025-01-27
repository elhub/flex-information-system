-- The accounting point table is purpose is to store information about accounting points from the Elhub system.
-- It is intended to be an
CREATE TABLE IF NOT EXISTS accounting_point (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    business_id text UNIQUE NOT NULL,
    balance_responsible_id bigint NULL,
    balance_responsible_party_type text GENERATED ALWAYS AS (
        'balance_responsible_party'
    ) STORED,
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    end_user_id text, -- org or personal id
    end_user_type text, -- 'person' or 'org'
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT fk_accounting_point_balance_responsible FOREIGN KEY (
        balance_responsible_id, balance_responsible_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT fk_accounting_point_system_operator FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT check_accounting_point_business_id_length CHECK (
        (char_length(business_id) = 18)
    ),
    -- TODO - a more proper check on end_user_id
    CONSTRAINT check_accounting_point_end_user_id_length
    CHECK (char_length(end_user_id) = 9 OR char_length(end_user_id) = 11),
    CONSTRAINT check_accounting_point_end_user_type
    CHECK (end_user_type = 'person' OR end_user_type = 'org')
);
