--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-key-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION flex.notice_key(
    in_party_id bigint,
    in_type ltree,
    in_source_resource text,
    in_source_id bigint,
    in_data jsonb
)
RETURNS text
SECURITY DEFINER
IMMUTABLE
LANGUAGE sql AS $$
SELECT
    md5(
        in_party_id::text || '-' ||
        in_type::text || '-' ||
        -- when no source, data becomes crucial to differentiate notices
        CASE
            WHEN in_source_resource IS null THEN in_data::text
            ELSE in_source_resource || '-' || in_source_id::text
        END
    )
$$;

-- NB: the precondition in addition to IF EXISTS is necessary, because if
-- notice already exists as a table, this line will make the DB complain
-- changeset flex:notice-view-remove runAlways:true endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'flex' AND table_name = 'notice' AND table_type = 'VIEW'
DROP VIEW IF EXISTS notice CASCADE;

-- changeset flex:notice-create runAlways:true endDelimiter:--
CREATE TABLE IF NOT EXISTS notice (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    party_id bigint NOT NULL,
    source_resource text NULL,
    source_id bigint NULL,
    type ltree NOT NULL,
    data jsonb NULL,
    status text NOT NULL,
    key text GENERATED ALWAYS AS (
        flex.notice_key(
            party_id,
            type,
            source_resource,
            source_id,
            data
        )
    ) STORED,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT flex.current_identity(),

    CONSTRAINT notice_party_fkey
    FOREIGN KEY (party_id) REFERENCES party (id),
    CONSTRAINT notice_type_check CHECK (
        type ~ 'no.elhub.flex.*'
    ),
    CONSTRAINT notice_status_check CHECK (
        status IN ('active', 'resolved')
    )
);
