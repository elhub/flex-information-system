-- Manually managed file
CREATE OR REPLACE VIEW accounting_point_energy_supplier
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        energy_supplier_id,
        valid_time_range,
        record_time_range,
        recorded_by
    FROM flex.accounting_point_energy_supplier
);

GRANT SELECT ON TABLE accounting_point_energy_supplier
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_energy_supplier
TO flex_common;
