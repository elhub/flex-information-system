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

GRANT SELECT ON accounting_point_energy_supplier
TO flex_common;
