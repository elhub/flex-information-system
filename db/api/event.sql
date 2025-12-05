--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-event-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.event
WITH (security_invoker = true) AS (
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source,
        CASE WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time -- noqa
    FROM flex.event
);
