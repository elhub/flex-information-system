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
ALTER TABLE flex.controllable_unit_history
RENAME COLUMN last_validated TO validated_at;

-- changeset flex:controllable-unit-status-suspended-becomes-inactive runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'controllable_unit_status_check' AND conbin::text LIKE '%115 117 115 112 101 110 100 101 100%'
-- (NB: searching for the ASCII codes for "suspended")
ALTER TABLE flex.controllable_unit
DROP CONSTRAINT controllable_unit_status_check;

UPDATE flex.controllable_unit
SET status = 'inactive'
WHERE status = 'suspended';

ALTER TABLE flex.controllable_unit
ADD CONSTRAINT controllable_unit_status_check CHECK (
    status IN (
        'new',
        'active',
        'inactive',
        'terminated'
    )
);

-- changeset flex:controllable-unit-grid-validation-status-approved-function runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION controllable_unit_grid_validation_status_approved()
RETURNS trigger
SECURITY INVOKER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.validated_at := current_timestamp;
    RETURN NEW;
END;
$$;

-- changeset flex:controllable-unit-grid-validation-status-approved-trigger runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_grid_validation_status_approved
BEFORE UPDATE OF grid_validation_status ON controllable_unit
FOR EACH ROW
WHEN (
    OLD.grid_validation_status IS DISTINCT FROM NEW.grid_validation_status -- noqa
    AND NEW.grid_validation_status = 'validated' -- noqa
    AND OLD.validated_at IS NULL AND NEW.validated_at IS NULL -- noqa
)
EXECUTE FUNCTION controllable_unit_grid_validation_status_approved();
