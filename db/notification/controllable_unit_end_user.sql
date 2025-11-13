--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-controllable-unit-end-user endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW notification.controllable_unit_end_user
WITH (security_invoker = true) AS (
    SELECT
        controllable_unit_id,
        end_user_id,
        valid_time_range
    FROM flex.controllable_unit_end_user
);

-- changeset flex:notification-controllable-unit-end-user-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.controllable_unit_end_user
TO flex_internal_event_notification;
