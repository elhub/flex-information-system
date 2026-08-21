--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-event-source-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION api.event_source(
    source_resource text,
    source_id bigint
)
RETURNS SETOF api.event
SECURITY INVOKER
STABLE
LANGUAGE sql
AS $$
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source,
        CASE
            WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time -- noqa
    FROM flex.event e
    WHERE e.source_resource IS NOT DISTINCT FROM event_source.source_resource
      AND e.source_id IS NOT DISTINCT FROM event_source.source_id;
$$;

-- changeset flex:api-event-source-grants runOnChange:true
GRANT EXECUTE ON FUNCTION api.event_source(text, integer)
TO flex_common;


-- changeset flex:api-event-subject-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE FUNCTION api.event_subject(
    subject_resource text,
    subject_id bigint
)
RETURNS SETOF api.event
SECURITY INVOKER
STABLE
LANGUAGE sql
AS $$
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source,
        CASE
            WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time -- noqa
    FROM flex.event e
    WHERE e.subject_resource IS NOT DISTINCT FROM event_subject.subject_resource
      AND e.subject_id IS NOT DISTINCT FROM event_subject.subject_id;
$$;

-- changeset flex:api-event-subject-grants runOnChange:true
GRANT EXECUTE ON FUNCTION api.event_subject(text, integer)
TO flex_common;
