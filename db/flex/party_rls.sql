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
USING (party.entity_id = flex.current_entity());

-- RLS: PTY-ENT002
-- security definer function avoids round trips in RLS policies
-- (PTYM-ENT001 checks the party table)
CREATE FUNCTION is_entity_in_party(
    in_entity_id bigint,
    in_party_id bigint
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1 FROM flex.party_membership AS pm
        WHERE pm.party_id = in_party_id AND pm.entity_id = in_entity_id
    )
$$;

CREATE POLICY "PTY_ENT002" ON party
FOR SELECT
TO flex_entity
USING (is_entity_in_party(flex.current_entity(), party.id));

-- RLS: PTY-COM002
-- RLS: PTY-COM003
GRANT SELECT ON party TO flex_common;
CREATE POLICY "PTY_COM002" ON party
FOR SELECT
TO flex_common
USING (type != 'end_user' OR EXISTS (
    SELECT 1 FROM party_membership pm WHERE pm.party_id = party.id -- noqa
));

-- RLS: PTY-FISO001
GRANT INSERT, SELECT, UPDATE ON party
TO flex_flexibility_information_system_operator;
CREATE POLICY "PTY_FISO001" ON party
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
