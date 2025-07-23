--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS accounting_point ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point
TO flex_internal_event_notification;
CREATE POLICY "AP_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: AP-COM001
GRANT SELECT ON accounting_point TO flex_common;
CREATE POLICY "AP_COM001"
ON accounting_point
FOR SELECT
TO flex_common
USING (true);
