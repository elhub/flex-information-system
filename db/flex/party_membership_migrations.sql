--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-scopes runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'party_membership' AND column_name = 'scopes'
ALTER TABLE flex.party_membership
DISABLE TRIGGER USER;
ALTER TABLE flex.party_membership
ADD COLUMN scopes text [];

UPDATE flex.party_membership
SET scopes = '{simple}';

ALTER TABLE flex.party_membership
ALTER COLUMN scopes SET NOT NULL;

-- noqa: disable=all
ALTER TABLE flex.party_membership
ADD CONSTRAINT check_party_membership_scopes CHECK (
    scopes != '{}' AND array['simple', 'admin', 'readonly'] @> scopes
);
-- noqa: enable=all

ALTER TABLE flex.party_membership_history
ADD COLUMN scopes text [];

UPDATE flex.party_membership_history
SET scopes = '{simple}';

ALTER TABLE flex.party_membership
ENABLE TRIGGER USER;

-- changeset flex:current-user-has-scope-create runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION
flex.current_user_has_scope(in_scope text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM flex.party_membership AS pm
        WHERE pm.party_id = (SELECT flex.current_party())
          AND pm.entity_id = (SELECT flex.current_entity())
          AND in_scope = ANY(pm.scopes)
    );
$$;
