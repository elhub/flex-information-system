--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

{%- set liquibase_resource = resource | replace("_", "-") %}
{%- set base_resource_ops = data.operations | list %}
{%- set lower_acronym = data.acronym | lower %}

-- changeset flex:{{ liquibase_resource }}-attachment-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.{{ resource }}_attachment (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    {{ resource }}_id bigint NOT NULL,
    attachment_id bigint NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT {{ lower_acronym }}a_{{ lower_acronym }}_fkey
    FOREIGN KEY ({{ resource }}_id)
    REFERENCES {{ resource }} (id)
    {%- if "delete" in base_resource_ops %}
    ON DELETE CASCADE
    {%- endif %},
    CONSTRAINT {{ lower_acronym }}a_attachment_fkey
    FOREIGN KEY (attachment_id)
    REFERENCES attachment (id)
);

-- changeset flex:{{ liquibase_resource }}-attachment-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER
{{ resource }}_attachment_event
AFTER INSERT OR DELETE
ON {{ resource }}_attachment
FOR EACH ROW
EXECUTE FUNCTION
capture_event('{{ resource }}');
