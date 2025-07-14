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
SET scopes = '{resources}';

ALTER TABLE flex.party_membership
ALTER COLUMN scopes SET NOT NULL;

-- noqa: disable=all
ALTER TABLE flex.party_membership
ADD CONSTRAINT check_party_membership_scopes CHECK (
    -- operator defined in utils/operators
    array_length(scopes, 1) > 0
    AND '^([a-z][a-z_]*)(:[a-z][a-z_]*)*$' #~ all(scopes)
);
-- noqa: enable=all

ALTER TABLE flex.party_membership_history
ADD COLUMN scopes text [];

UPDATE flex.party_membership_history
SET scopes = '{resources}';

ALTER TABLE flex.party_membership
ENABLE TRIGGER USER;
