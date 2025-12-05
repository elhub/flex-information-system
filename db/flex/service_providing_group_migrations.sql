--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-status-inactive runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:3 SELECT COUNT(*) FROM (SELECT regexp_matches(conbin, '\[', 'g') FROM pg_catalog.pg_constraint WHERE conname = 'service_providing_group_status_check') bracket_occurrences
-- (NB: string constants are represented with an array of ASCII codes, if we
-- find 3 arrays it means the status enum has 3 values, which is a way to spot
-- that 'inactive' is missing)
ALTER TABLE flex.service_providing_group
DROP CONSTRAINT service_providing_group_status_check;

ALTER TABLE flex.service_providing_group
ADD CONSTRAINT service_providing_group_status_check CHECK (
    status IN (
        'new',
        'active',
        'inactive',
        'terminated'
    )
);

-- changeset flex:service-providing-group-add-bidding-zone-column runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group' AND column_name = 'bidding_zone'
ALTER TABLE flex.service_providing_group
DISABLE TRIGGER USER;

ALTER TABLE flex.service_providing_group
ADD COLUMN bidding_zone text;

UPDATE flex.service_providing_group
SET bidding_zone = 'NO3'
WHERE bidding_zone IS NULL;

ALTER TABLE flex.service_providing_group_history
ADD COLUMN bidding_zone text;

UPDATE flex.service_providing_group_history
SET bidding_zone = 'NO3'
WHERE bidding_zone IS NULL;

ALTER TABLE flex.service_providing_group
ALTER COLUMN bidding_zone SET NOT NULL;

ALTER TABLE flex.service_providing_group
ENABLE TRIGGER USER;

-- changeset flex:check-service-providing-group-bidding-zone runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'check_service_providing_group_bidding_zone'
ALTER TABLE flex.service_providing_group
ADD CONSTRAINT check_service_providing_group_bidding_zone CHECK (
    bidding_zone IN ('NO1', 'NO2', 'NO3', 'NO4', 'NO5')
);
