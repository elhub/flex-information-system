--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-scopes runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'party_membership' AND column_name = 'scopes'
ALTER TABLE flex.party_membership
DISABLE TRIGGER USER;
ALTER TABLE flex.party_membership
ADD COLUMN scopes text [] DEFAULT '{}';

UPDATE flex.party_membership
SET scopes = '{}';

ALTER TABLE flex.party_membership
ALTER COLUMN scopes SET NOT NULL;

ALTER TABLE flex.party_membership_history
ADD COLUMN scopes text [];

UPDATE flex.party_membership_history
SET scopes = '{}';

ALTER TABLE flex.party_membership
ENABLE TRIGGER USER;
