--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-event-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.event
WITH (security_invoker = true) AS (
    SELECT
        id,
        '1.0' AS specversion,
        type,
        source,
        data,
        lower(record_time_range) AS time -- noqa
    FROM flex.event
);
