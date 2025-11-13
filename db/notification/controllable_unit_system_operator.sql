--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-controllable-unit-system-operator runAlways:true endDelimiter:--
CREATE OR REPLACE VIEW notification.controllable_unit_system_operator
WITH (security_invoker = true) AS (
    SELECT
        controllable_unit_id,
        system_operator_id,
        valid_time_range
    FROM flex.controllable_unit_system_operator
);

-- changeset flex:notification-controllable-unit-system-operator-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.controllable_unit_system_operator
TO flex_internal_event_notification;
