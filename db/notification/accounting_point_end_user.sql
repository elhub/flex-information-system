--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-accounting-point-end-user endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW notification.accounting_point_end_user
WITH (security_invoker = true) AS (
    SELECT
        accounting_point_id,
        end_user_id,
        valid_time_range
    FROM flex.accounting_point_end_user
);

-- changeset flex:notification-accounting-point-end-user-grant endDelimiter:; runOnChange:true
GRANT SELECT ON TABLE notification.accounting_point_end_user
TO flex_internal_event_notification;
