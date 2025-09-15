--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-accounting-point-id-type-update runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:'text' SELECT data_type FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit' AND column_name = 'accounting_point_id'
ALTER TABLE flex.controllable_unit
DISABLE TRIGGER USER;

ALTER TABLE flex.controllable_unit
ADD COLUMN tmp_accounting_point_id bigint;

UPDATE flex.controllable_unit
SET tmp_accounting_point_id = (
    SELECT ap.id
    FROM flex.accounting_point AS ap
    WHERE ap.business_id = flex.controllable_unit.accounting_point_id
);

ALTER TABLE flex.controllable_unit
DROP COLUMN accounting_point_id CASCADE;

ALTER TABLE flex.controllable_unit
RENAME COLUMN tmp_accounting_point_id TO accounting_point_id;

ALTER TABLE flex.controllable_unit
ADD CONSTRAINT controllable_unit_accounting_point_id_fkey
FOREIGN KEY (accounting_point_id)
REFERENCES flex.accounting_point (id);

ALTER TABLE flex.controllable_unit
ENABLE TRIGGER USER;

ALTER TABLE flex.controllable_unit_history
ADD COLUMN tmp_accounting_point_id bigint;

UPDATE flex.controllable_unit_history
SET tmp_accounting_point_id = (
    SELECT ap.id
    FROM flex.accounting_point AS ap
    WHERE ap.business_id = flex.controllable_unit_history.accounting_point_id
);

ALTER TABLE flex.controllable_unit_history
DROP COLUMN accounting_point_id CASCADE;

ALTER TABLE flex.controllable_unit_history
RENAME COLUMN tmp_accounting_point_id TO accounting_point_id;

-- changeset flex:controllable-unit-accounting-point-id-restore-nullable runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit' AND is_nullable = 'YES' AND column_name = 'accounting_point_id'
ALTER TABLE flex.controllable_unit
ALTER COLUMN accounting_point_id SET NOT NULL;

-- changeset flex:controllable-unit-rename-validated-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit' AND column_name = 'last_validated'
ALTER TABLE flex.controllable_unit
RENAME COLUMN last_validated TO validated_at;
