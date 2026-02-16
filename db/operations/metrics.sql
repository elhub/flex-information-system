--liquibase formatted sql

-- changeset flex:operations-metrics-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW operations.metrics
WITH (security_invoker = false)
AS
WITH
    event_stats AS (
        SELECT
            COALESCE(MAX(id), 0) AS max_all,
            MAX(CASE WHEN processed = false THEN id END) AS max_unprocessed,
            MIN(CASE WHEN processed = false THEN id END) AS min_unprocessed
        FROM flex.event
    )

SELECT
    'flex_event_processing_gap' AS metric_label,
    'gauge' AS metric_type,
    (
        SELECT COALESCE(max_unprocessed, max_all) - COALESCE(min_unprocessed, max_all)
        FROM event_stats
    ) AS metric_value,
    NOW() AS metric_timestamp
UNION ALL
SELECT
    'flex_event_unprocessed_count' AS metric_label,
    'gauge' AS metric_type,
    (
        SELECT COALESCE(COUNT(*), 0) FROM flex.event
        WHERE processed = false
    ) AS metric_value,
    NOW() AS metric_timestamp
UNION ALL
SELECT
    'flex_event_processed_max' AS metric_label,
    'counter' AS metric_type,
    (
        SELECT COALESCE(MAX(id), 0) FROM flex.event
        WHERE processed = true
    ) AS metric_value,
    NOW() AS metric_timestamp
