--liquibase formatted sql
-- Manually managed file

-- changeset flex:party-membership-scopes runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'party_membership' AND column_name = 'scopes'
ALTER TABLE flex.party_membership
DISABLE TRIGGER USER;
ALTER TABLE flex.party_membership
ADD COLUMN scopes flex.scope [];

UPDATE flex.party_membership
SET scopes = '{manage:data, manage:auth}'
WHERE scopes IS null OR array_length(scopes, 1) = 0;

ALTER TABLE flex.party_membership
ALTER COLUMN scopes SET NOT NULL;

ALTER TABLE flex.party_membership
ADD CONSTRAINT check_scopes_not_empty CHECK (
    array_length(scopes, 1) > 0
);

ALTER TABLE flex.party_membership_history
ADD COLUMN scopes flex.scope [];

UPDATE flex.party_membership_history
SET scopes = '{manage:data, manage:auth}';

ALTER TABLE flex.party_membership
ENABLE TRIGGER USER;
