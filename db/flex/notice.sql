--liquibase formatted sql
-- Manually managed file

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
    source text NOT NULL,
    type ltree NOT NULL,
    data jsonb,
    recorded_at timestamptz NOT NULL DEFAULT localtimestamp,

    CONSTRAINT notice_party_fkey
    FOREIGN KEY (party_id) REFERENCES party (id),
    CONSTRAINT notice_source_check CHECK (
        source ~ '^(\/([a-z][a-z_]*|[0-9]+))+$'
    ),
    CONSTRAINT notice_type_check CHECK (
        type ~ 'no.elhub.flex.*'
    )
);
