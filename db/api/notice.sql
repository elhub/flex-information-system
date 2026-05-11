--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-notice-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.notice
WITH (security_invoker = true) AS (
    SELECT
        n.id,
        n.party_id,
        n.type,
        n.status,
        n.recorded_by,
        CASE
            WHEN n.data IS null THEN null
            ELSE n.data || jsonb_build_object('notice_type', n.type::text)
        END AS data, -- noqa
        CASE
            WHEN n.source_resource IS null OR n.source_id IS null THEN null
            ELSE '/' || n.source_resource || '/' || n.source_id
        END
        AS source,
        lower(n.record_time_range) AS recorded_at
    FROM flex.notice AS n
);
