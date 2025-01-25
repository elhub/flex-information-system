-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW notification
WITH (security_invoker = true) AS (
    SELECT
        id,
        acknowledged,
        event_id,
        party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.notification
);
