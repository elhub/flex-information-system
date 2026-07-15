--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

{%- set liquibase_resource = resource | replace("_", "-") %}
{%- set lower_acronym = data.acronym | lower %}

-- changeset flex:api-{{ liquibase_resource }}-attachment-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.{{ resource }}_attachment
WITH (security_invoker = true) AS (
    SELECT
        {{ lower_acronym }}a.id,
        {{ lower_acronym }}a.recorded_by,
        lower({{ lower_acronym }}a.record_time_range) AS recorded_at,
        {{ lower_acronym }}a.{{ resource }}_id,
        att.object_id,
        att.filename,
        att.filename_sanitised,
        att.content_type,
        att.size_bytes
    FROM flex.{{ resource }}_attachment AS {{ lower_acronym }}a
        INNER JOIN flex.attachment AS att
            ON {{ lower_acronym }}a.attachment_id = att.id
);

-- changeset flex:api-{{ liquibase_resource }}-attachment-stateful-operation-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
{{ lower_acronym }}_attachment_stateful_operation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    l_attachment_id bigint;
    l_link_id bigint;
    l_link_record_time_range tstzrange;
    l_link_recorded_by bigint;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- first create the attachment
        INSERT INTO flex.attachment (
            object_id,
            filename,
            filename_sanitised,
            content_type,
            size_bytes
        ) VALUES (
            NEW.object_id,
            NEW.filename,
            NEW.filename_sanitised,
            NEW.content_type,
            NEW.size_bytes
        ) RETURNING id INTO l_attachment_id;

        -- then the link
        INSERT INTO flex.{{ resource }}_attachment (
            {{ resource }}_id,
            attachment_id
        ) VALUES (
            NEW.{{ resource }}_id,
            l_attachment_id
        ) RETURNING id, record_time_range, recorded_by
        INTO l_link_id, l_link_record_time_range, l_link_recorded_by;

        -- enrich the returned record so it matches the view definition
        NEW.id := l_link_id;
        NEW.recorded_at := lower(l_link_record_time_range);
        NEW.recorded_by := l_link_recorded_by;

        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- first delete the link, getting the attachment ID
        DELETE FROM flex.{{ resource }}_attachment
        WHERE id = OLD.id
        RETURNING attachment_id INTO l_attachment_id;

        -- then delete the attachment
        DELETE FROM flex.attachment
        WHERE id = l_attachment_id;

        RETURN OLD;
    ELSE
        RAISE EXCEPTION 'Unsupported operation: %', TG_OP;
    END IF;
END;
$$;

-- changeset flex:api-{{ liquibase_resource }}-attachment-stateful-operation-trigger endDelimiter:-- runOnChange:true
CREATE TRIGGER
{{ lower_acronym }}_attachment_stateful_operation_trigger
INSTEAD OF INSERT OR DELETE
ON api.{{ resource }}_attachment
FOR EACH ROW EXECUTE FUNCTION
{{ lower_acronym }}_attachment_stateful_operation();

-- changeset flex:api-{{ liquibase_resource }}-attachment-can-edit-function endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION
api.{{ resource }}_attachment_can_edit(
    in_{{ resource }}_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
SELECT EXISTS (
    SELECT 1
    FROM flex.{{ resource }}_involved_parties
        AS {{ lower_acronym }}_ip
    WHERE {{ lower_acronym }}_ip.{{ resource }}_id
    = in_{{ resource }}_id
        AND {{ lower_acronym }}_ip.party_id = (SELECT flex.current_party())
);
$$;
