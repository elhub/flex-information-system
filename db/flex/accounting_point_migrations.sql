--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-drop-system-operator runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:2 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point' AND column_name like '%system_operator%';
-- ALTER TABLE flex.accounting_point
-- DISABLE TRIGGER USER;

ALTER TABLE flex.accounting_point
DROP COLUMN system_operator_party_type CASCADE;

ALTER TABLE flex.accounting_point
DROP COLUMN system_operator_id CASCADE;

-- ALTER TABLE flex.accounting_point
-- ENABLE TRIGGER USER;

ALTER TABLE flex.accounting_point_history
DROP COLUMN system_operator_party_type;

ALTER TABLE flex.accounting_point_history
DROP COLUMN system_operator_id;

-- changeset flex:accounting-point-add-geolocation runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point' AND column_name = 'latitude';

ALTER TABLE flex.accounting_point
ADD COLUMN IF NOT EXISTS latitude double precision NULL,
ADD COLUMN IF NOT EXISTS longitude double precision NULL;

ALTER TABLE flex.accounting_point
DROP CONSTRAINT IF EXISTS accounting_point_latitude_check,
ADD CONSTRAINT accounting_point_latitude_check CHECK (latitude BETWEEN -90 AND 90);

ALTER TABLE flex.accounting_point
DROP CONSTRAINT IF EXISTS accounting_point_longitude_check,
ADD CONSTRAINT accounting_point_longitude_check CHECK (longitude BETWEEN -180 AND 180);

ALTER TABLE flex.accounting_point_history
ADD COLUMN IF NOT EXISTS latitude double precision NULL,
ADD COLUMN IF NOT EXISTS longitude double precision NULL;
