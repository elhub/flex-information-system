--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-energy-supplier-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS accounting_point_energy_supplier
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point_energy_supplier
TO flex_internal_event_notification;
CREATE POLICY "APES_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON accounting_point_energy_supplier_history
TO flex_internal_event_notification;
CREATE POLICY "APESH_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_energy_supplier_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON accounting_point_energy_supplier
TO flex_common;
CREATE POLICY "APES_INTERNAL_COMMON"
ON accounting_point_energy_supplier
FOR SELECT
TO flex_common
USING (true);
