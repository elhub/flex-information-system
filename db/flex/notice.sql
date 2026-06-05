--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS notice (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    party_id bigint NOT NULL,
    source_resource text NULL,
    source_id bigint NULL,
    type ltree NOT NULL,
    data jsonb NULL,
    status text NOT NULL,
    deduplication_key text NOT NULL,
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

-- changeset flex:notice-index runOnChange:true endDelimiter:--
CREATE INDEX IF NOT EXISTS notice_index_party_id_status
ON flex.notice (party_id, status);

-- changeset flex:notice-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER notice_event
AFTER INSERT OR UPDATE ON notice
FOR EACH ROW
EXECUTE FUNCTION capture_event();
