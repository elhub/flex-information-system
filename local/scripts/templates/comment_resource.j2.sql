--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

{%- set liquibase_resource = resource | replace("_", "-") %}
{%- set base_resource_ops = data.operations | list %}
{%- set base_resource_initials = resource.split('_') | map('first') | join  %}

-- changeset flex:{{ liquibase_resource }}-comment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS {{ resource }}_comment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    {{ resource }}_id bigint NOT NULL,
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

    CONSTRAINT {{ resource }}_comment_visibility_check
    CHECK (
        visibility IN (
            'same_party',
            'any_involved_party'
        )
    ),
    CONSTRAINT {{ resource }}_comment_{{ base_resource_initials }}_fkey
    FOREIGN KEY ({{ resource }}_id)
    REFERENCES {{ resource }} (id)
    {%- if "delete" in base_resource_ops %}
    ON DELETE CASCADE
    {%- endif %}
);

-- changeset flex:{{ liquibase_resource }}-comment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
{{ resource }}_comment_event
AFTER INSERT OR UPDATE
ON {{ resource }}_comment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('{{ resource }}_comment');
