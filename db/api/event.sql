-- Manually managed file

CREATE OR REPLACE VIEW event
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
