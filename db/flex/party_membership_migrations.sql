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
SET scopes = '{data:manage, auth:manage}';

ALTER TABLE flex.party_membership
ALTER COLUMN scopes SET NOT NULL;

-- noqa: disable=all
ALTER TABLE flex.party_membership
ADD CONSTRAINT check_party_membership_scopes CHECK (
    scopes != '{}'
    AND array[
        'data:read',
        'data:use',
        'data:manage',
        'auth:read',
        'auth:use',
        'auth:manage'
    ] @> scopes
);
-- noqa: enable=all

ALTER TABLE flex.party_membership_history
ADD COLUMN scopes text [];

UPDATE flex.party_membership_history
SET scopes = '{data:manage, auth:manage}';

ALTER TABLE flex.party_membership
ENABLE TRIGGER USER;
