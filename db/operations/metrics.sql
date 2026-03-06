--liquibase formatted sql

-- changeset flex:operations-metrics-view runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW operations.metrics
WITH (security_invoker = false)
AS
WITH
    event_stats AS (
        SELECT
            COALESCE(COUNT(*) FILTER (WHERE processed = false), 0) AS unprocessed_count,
            COALESCE(MAX(id), 0) AS max_all,
            COALESCE(MAX(CASE WHEN processed = true THEN id END), 0) AS processed_max,
            COALESCE(
                MAX(CASE WHEN processed = false THEN id END), 0
            ) AS unprocessed_max,
            COALESCE(MIN(CASE WHEN processed = false THEN id END), 0) AS unprocessed_min
        FROM flex.event
    )

SELECT
    'flex_event_processing_gap' AS metric_label,
    'gauge' AS metric_type,
    (
        SELECT unprocessed_max - unprocessed_min
        FROM event_stats
    ) AS metric_value,
    NOW() AS metric_timestamp
UNION ALL
SELECT
    'flex_event_unprocessed_count' AS metric_label,
    'gauge' AS metric_type,
    (
        SELECT unprocessed_count
        FROM event_stats
    ) AS metric_value,
    NOW() AS metric_timestamp
UNION ALL
SELECT
    'flex_event_processed_max' AS metric_label,
    'counter' AS metric_type,
    (
        SELECT processed_max
        FROM event_stats
    ) AS metric_value,
    NOW() AS metric_timestamp
