ALTER TABLE IF EXISTS accounting_point_end_user
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point_end_user
TO flex_internal_event_notification;
CREATE POLICY "APEU_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_end_user
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- for internal use in RLS
GRANT SELECT ON accounting_point_end_user
TO flex_common;
CREATE POLICY "APEU_COMMON"
ON accounting_point_end_user
FOR SELECT
TO flex_common
USING (true);
