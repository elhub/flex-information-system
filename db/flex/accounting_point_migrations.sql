--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-add-location runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point' AND column_name = 'location';

ALTER TABLE flex.accounting_point_history
ADD COLUMN IF NOT EXISTS location GEOMETRY (POINT, 4326) NULL;

ALTER TABLE flex.accounting_point
ADD COLUMN IF NOT EXISTS location GEOMETRY (POINT, 4326) NULL;

-- changeset flex:accounting-point-location-index runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:t SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point' AND column_name = 'location');
CREATE INDEX IF NOT EXISTS accounting_point_location_idx
ON flex.accounting_point USING gist (location);
