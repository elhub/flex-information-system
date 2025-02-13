ALTER TABLE IF EXISTS accounting_point_balance_responsible_party
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_internal_event_notification;
CREATE POLICY "APBRP_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_balance_responsible_party
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON accounting_point_balance_responsible_party
TO flex_common;
