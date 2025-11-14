--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:controllable-unit-suspension-comment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS controllable_unit_suspension_comment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    controllable_unit_suspension_id bigint NOT NULL,
    visibility text NOT NULL DEFAULT 'same_party',
    content text NULL CHECK (
        char_length(content) <= 2048
    ),
    created_by bigint NOT NULL DEFAULT current_identity(),
    created_at timestamp with time zone NOT NULL DEFAULT current_timestamp,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT
    controllable_unit_suspension_comment_visibility_check
    CHECK (
        visibility IN (
            'same_party',
            'any_involved_party'
        )
    ),
    CONSTRAINT
    controllable_unit_suspension_comment_cus_fkey
    FOREIGN KEY (controllable_unit_suspension_id)
    REFERENCES controllable_unit_suspension (id)
    ON DELETE CASCADE
);

-- changeset flex:controllable-unit-suspension-comment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_comment_event
AFTER INSERT OR UPDATE
ON controllable_unit_suspension_comment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('controllable_unit_suspension_comment');
