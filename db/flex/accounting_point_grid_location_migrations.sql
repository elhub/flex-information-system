--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-grid-location-business-id-not-null runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point_grid_location' AND column_name = 'business_id' AND is_nullable = 'YES'

ALTER TABLE flex.accounting_point_grid_location
ALTER COLUMN business_id SET NOT NULL;

-- changeset flex:accounting-point-grid-location-object-type-drop-transformer runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_class t ON t.oid = c.conrelid JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'flex' AND t.relname = 'accounting_point_grid_location' AND c.conname = 'accounting_point_grid_location_object_type_check' AND pg_get_constraintdef(c.oid) LIKE '%transformer%'

ALTER TABLE flex.accounting_point_grid_location
DROP CONSTRAINT accounting_point_grid_location_object_type_check;

ALTER TABLE flex.accounting_point_grid_location
ADD CONSTRAINT accounting_point_grid_location_object_type_check
CHECK (object_type IN ('substation'));

-- changeset flex:accounting-point-grid-location-business-id-use-validate-function runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_class t ON t.oid = c.conrelid JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace WHERE n.nspname = 'flex' AND t.relname = 'accounting_point_grid_location' AND c.conname = 'accounting_point_grid_location_business_id_check' AND pg_get_constraintdef(c.oid) LIKE '%~*%'

ALTER TABLE flex.accounting_point_grid_location
DROP CONSTRAINT accounting_point_grid_location_business_id_check;

ALTER TABLE flex.accounting_point_grid_location
ADD CONSTRAINT accounting_point_grid_location_business_id_check
CHECK (validate_business_id(business_id, 'uuid'));
