--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-notification-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.notification
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
