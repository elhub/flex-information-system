--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-controllable-unit-system-operator runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW notification.controllable_unit_system_operator
WITH (security_invoker = false) AS (
    SELECT
        cu.id AS controllable_unit_id,
        apso.system_operator_id,
        apso.valid_time_range
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point_system_operator AS apso
            ON cu.accounting_point_id = apso.accounting_point_id
);

-- changeset flex:notification-controllable-unit-system-operator-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE notification.controllable_unit_system_operator
TO flex_internal_event_notification;
