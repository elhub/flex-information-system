--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-accounting-point-end-user endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW notification.accounting_point_end_user
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        end_user_id,
        valid_time_range,
        record_time_range,
        recorded_by
    FROM flex.accounting_point_end_user
);

-- changeset flex:notification-accounting-point-end-user-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.accounting_point_end_user
TO flex_internal_event_notification;
