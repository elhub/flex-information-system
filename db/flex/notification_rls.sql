--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS notification ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT, INSERT ON notification TO flex_internal_event_notification;
CREATE POLICY "PTY_INTERNAL_EVENT_NOTIFICATION" ON notification
FOR ALL
TO flex_internal_event_notification
USING (true);

-- RLS: NOT-COM001
GRANT SELECT, UPDATE ON notification TO flex_common;
CREATE POLICY "NOT_COM001" ON notification
FOR ALL
TO flex_common
USING (party_id = (SELECT flex.current_party()));

-- RLS: NOT-FISO001
CREATE POLICY "NOT_FISO001" ON notification
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
