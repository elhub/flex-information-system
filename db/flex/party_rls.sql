--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS party ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON party TO flex_internal_event_notification;
CREATE POLICY "PTY_INTERNAL_EVENT_NOTIFICATION" ON party
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON party_history TO flex_internal_event_notification;
CREATE POLICY "PTYH_INTERNAL_EVENT_NOTIFICATION" ON party
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: PTY-ENT001
GRANT SELECT ON party TO flex_entity;
CREATE POLICY "PTY_ENT001" ON party
FOR SELECT
TO flex_entity
USING (
    EXISTS (SELECT 1 FROM party_membership pm WHERE pm.party_id = party.id) -- noqa
    AND 'auth:read' IN (SELECT flex.current_scopes())
);

-- RLS: PTY-ENT002
CREATE POLICY "PTY_ENT002" ON party
FOR SELECT
TO flex_entity
USING (
    entity_id = (SELECT current_entity())
    AND 'auth:read' IN (SELECT flex.current_scopes())
);

-- RLS: PTY-COM002
-- RLS: PTY-COM003
GRANT SELECT ON party TO flex_common;
CREATE POLICY "PTY_COM002" ON party
FOR SELECT
TO flex_common
USING (
    (type != 'end_user' OR EXISTS (
        SELECT 1 FROM party_membership pm WHERE pm.party_id = party.id -- noqa
    ))
    AND 'auth:read' IN (SELECT flex.current_scopes())
);

GRANT INSERT, SELECT, UPDATE ON party
TO flex_flexibility_information_system_operator;
-- RLS: PTY-FISO001
CREATE POLICY "PTY_FISO001" ON party
FOR SELECT
TO flex_flexibility_information_system_operator
USING ('auth:read' IN (SELECT flex.current_scopes()));
-- RLS: PTY-FISO002
CREATE POLICY "PTY_FISO002_INSERT" ON party
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK ('auth:manage' IN (SELECT flex.current_scopes()));
CREATE POLICY "PTY_FISO002_UPDATE" ON party
FOR UPDATE
TO flex_flexibility_information_system_operator
USING ('auth:manage' IN (SELECT flex.current_scopes()));
