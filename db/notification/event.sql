--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-event endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW notification.event
WITH (security_invoker = true) AS (
    SELECT
        id,
        type,
        source_resource,
        source_id,
        data,
        record_time_range,
        recorded_by,
        subject_resource,
        subject_id,
        processed,
        lower(record_time_range) AS recorded_at
    FROM flex.event
);

-- changeset flex:notification-event-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.event
TO flex_internal_event_notification;

GRANT UPDATE (processed) ON notification.event
TO flex_internal_event_notification;
