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
    source_resource text NOT NULL,
    source_id bigint NOT NULL,
    type ltree NOT NULL,
    data jsonb NULL,
    status text NOT NULL,
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
