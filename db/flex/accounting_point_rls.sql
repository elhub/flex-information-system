-- We shouldn't really need RLS, but keeping the filename consistent with the other tables
GRANT SELECT ON flex.accounting_point TO flex_common;

-- internal
GRANT SELECT ON accounting_point TO flex_internal_event_notification;
CREATE POLICY "AP_INTERNAL_EVENT_NOTIFICATION" ON accounting_point
FOR SELECT
TO flex_internal_event_notification
USING (true);
