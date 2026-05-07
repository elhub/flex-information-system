--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-accounting-point-system-operator runAlways:true endDelimiter:--
CREATE OR REPLACE VIEW notification.accounting_point_system_operator
WITH (security_invoker = true) AS (
    SELECT
        accounting_point_id,
        system_operator_id,
        valid_time_range
    FROM flex.accounting_point_system_operator
);

-- changeset flex:notification-accounting-point-system-operator-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.accounting_point_system_operator
TO flex_internal_event_notification;
