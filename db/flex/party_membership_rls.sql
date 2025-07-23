--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS party_membership ENABLE ROW LEVEL SECURITY;

GRANT INSERT,
SELECT,
UPDATE,
DELETE ON party_membership TO flex_flexibility_information_system_operator;
-- RLS: PTYM-FISO001
CREATE POLICY "PTYM_FISO001" ON party_membership
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
-- RLS: PTYM-FISO002
CREATE POLICY "PTYM_FISO002_INSERT" ON party_membership
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK (true);
CREATE POLICY "PTYM_FISO002_UPDATE" ON party_membership
FOR UPDATE
TO flex_flexibility_information_system_operator
USING (true);
CREATE POLICY "PTYM_FISO002_DELETE" ON party_membership
FOR DELETE
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: PTYM-FISO003
GRANT SELECT ON party_membership_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "PTYM_FISO002" ON party_membership_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: PTYM-ENT001
GRANT SELECT ON party_membership TO flex_entity;
CREATE POLICY "PTYM_ENT001" ON party_membership
FOR SELECT
TO flex_entity
USING (entity_id = (SELECT current_entity()));

-- security definer function to avoid round trips in RLS policies
CREATE OR REPLACE FUNCTION entity_owns_party(
    in_entity_id bigint,
    in_party_id bigint
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1 FROM flex.party AS p
        WHERE p.id = in_party_id AND p.entity_id = in_entity_id
    )
$$;

-- RLS: PTYM-ENT002
CREATE POLICY "PTYM_ENT002" ON party_membership
FOR SELECT
TO flex_entity
USING (entity_owns_party((SELECT current_entity()), party_id));

-- RLS: PTYM-COM002
GRANT SELECT ON party_membership TO flex_common;
CREATE POLICY "PTYM_COM002" ON party_membership
FOR SELECT
TO flex_common
USING (party_id = (SELECT current_party()));

-- RLS: PTYM-COM003
CREATE POLICY "PTYM_COM003" ON party_membership_history
FOR SELECT
TO flex_common
USING (party_id = (SELECT current_party()));
