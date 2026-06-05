--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS party_membership ENABLE ROW LEVEL SECURITY;

-- RLS: PTYM-FISO001
GRANT INSERT,
SELECT,
UPDATE,
DELETE ON party_membership TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "PTYM_FISO001" ON party_membership;
CREATE POLICY "PTYM_FISO001" ON party_membership
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: PTYM-FISO002
GRANT SELECT ON party_membership
TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "PTYM_FISO002" ON party_membership_history;
CREATE POLICY "PTYM_FISO002" ON party_membership_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: PTYM-ENT001
GRANT SELECT ON party_membership TO flex_entity;
DROP POLICY IF EXISTS "PTYM_ENT001" ON party_membership;
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
DROP POLICY IF EXISTS "PTYM_ENT002" ON party_membership;
CREATE POLICY "PTYM_ENT002" ON party_membership
FOR SELECT
TO flex_entity
USING (entity_owns_party((SELECT current_entity()), party_id));

-- RLS: PTYM-COM001
GRANT SELECT ON party_membership TO flex_common;
DROP POLICY IF EXISTS "PTYM_COM001" ON party_membership;
CREATE POLICY "PTYM_COM001" ON party_membership
FOR SELECT
TO flex_common
USING (party_id = (SELECT current_party()));

-- RLS: PTYM-COM002
DROP POLICY IF EXISTS "PTYM_COM002" ON party_membership_history;
CREATE POLICY "PTYM_COM002" ON party_membership_history
FOR SELECT
TO flex_common
USING (party_id = (SELECT current_party()));

GRANT SELECT, INSERT, UPDATE, DELETE ON party_membership TO flex_organisation;
-- RLS: PTYM-ORG001
DROP POLICY IF EXISTS "PTYM_ORG001" ON party_membership;
CREATE POLICY "PTYM_ORG001" ON party_membership
FOR ALL
TO flex_organisation
USING (entity_owns_party((SELECT flex.current_party_owner()), party_id));

-- RLS: PTYM-ORG002
-- can use the same check as the main table policy because entity/party are
-- not deletable and owning party is immutable
GRANT SELECT ON party_membership_history TO flex_organisation;
DROP POLICY IF EXISTS "PTYM_ORG002" ON party_membership_history;
CREATE POLICY "PTYM_ORG002" ON party_membership_history
FOR SELECT
TO flex_organisation
USING (entity_owns_party((SELECT flex.current_party_owner()), party_id));
