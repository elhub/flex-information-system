--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-energy-supplier-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_energy_supplier
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

-- changeset flex:api-accounting-point-energy-supplier-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE api.accounting_point_energy_supplier
TO flex_internal_event_notification;

GRANT SELECT ON TABLE api.accounting_point_energy_supplier
TO flex_common;
