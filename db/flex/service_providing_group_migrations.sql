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
