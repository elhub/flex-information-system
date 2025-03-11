ALTER TABLE IF EXISTS party_membership ENABLE ROW LEVEL SECURITY;

-- RLS: PTYM-FISO001
GRANT INSERT,
SELECT,
DELETE ON party_membership TO flex_flexibility_information_system_operator;
CREATE POLICY "PTYM_FISO001" ON party_membership
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: PTYM-FISO002
GRANT SELECT ON party_membership
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
USING (entity_id = current_entity());

-- RLS: PTYM-COM002
GRANT SELECT ON party_membership TO flex_common;
CREATE POLICY "PTYM_COM002" ON party_membership
FOR SELECT
TO flex_common
USING (party_id = current_party());

-- RLS: PTYM-COM003
CREATE POLICY "PTYM_COM003" ON party_membership_history
FOR SELECT
TO flex_common
USING (party_id = current_party());
