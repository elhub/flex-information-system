--liquibase formatted sql
-- Manually managed file

-- changeset flex:attachment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS attachment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    object_id uuid NOT NULL DEFAULT public.uuid_generate_v4(),
    filename text NOT NULL,
    filename_sanitised text NOT NULL,
    content_type text NOT NULL DEFAULT 'application/pdf',
    size_bytes bigint NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT attachment_object_id_unique UNIQUE (object_id),
    CONSTRAINT attachment_content_type_check CHECK (
        content_type IN (
            'application/pdf',
            'image/jpeg',
            'image/png'
        )
    ),
    CONSTRAINT attachment_size_bytes_check CHECK (size_bytes > 0),
    CONSTRAINT attachment_filename_check CHECK (
        char_length(filename) >= 1
        AND char_length(filename) <= 256
    ),
    CONSTRAINT attachment_filename_sanitised_check CHECK (
        char_length(filename_sanitised) >= 1
        AND char_length(filename_sanitised) <= 256
    )
);

-- changeset flex:attachment-grants runOnChange:true endDelimiter:;
GRANT SELECT, INSERT, DELETE ON attachment TO flex_common;
