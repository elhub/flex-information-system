--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-create runOnChange:false endDelimiter:;
--validCheckSum: 9:6f08cc10fbe8b771a25fb62cab9dd747
CREATE TABLE IF NOT EXISTS entity (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    type text NOT NULL,
    business_id text NOT NULL UNIQUE,
    business_id_type text NOT NULL REFERENCES business_id_type (name),
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
    CONSTRAINT check_entity_type_business_id_type CHECK (
        (type = 'person' AND business_id_type IN ('pid', 'email'))
        OR (type = 'organisation' AND business_id_type = 'org')
    )
);
