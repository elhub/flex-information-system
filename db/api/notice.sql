--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-notice-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.notice
WITH (security_invoker = true) AS (
    SELECT
        id,
        data,
        party_id,
        type,
        status,
        recorded_by,
        CASE
            WHEN source_resource IS null OR source_id IS null THEN null
            ELSE '/' || source_resource || '/' || source_id
        END
        AS source,
        lower(record_time_range) AS recorded_at
    FROM flex.notice
);
