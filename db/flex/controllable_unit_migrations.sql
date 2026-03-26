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

-- changeset flex:controllable-unit-maximum-active-power-rename runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'controllable_unit' AND column_name = 'maximum_available_capacity'
ALTER TABLE flex.controllable_unit
DISABLE TRIGGER USER;

ALTER TABLE flex.controllable_unit
RENAME COLUMN maximum_available_capacity TO maximum_active_power;

ALTER TABLE flex.controllable_unit_history
RENAME COLUMN maximum_available_capacity TO maximum_active_power;

ALTER TABLE flex.controllable_unit
RENAME CONSTRAINT controllable_unit_maximum_available_capacity_check
TO controllable_unit_maximum_active_power_check;

ALTER TABLE flex.controllable_unit
ENABLE TRIGGER USER;

-- changeset flex:controllable-unit-grid-validation-status-reset-trigger-drop runOnChange:true endDelimiter:--
DROP TRIGGER IF EXISTS
controllable_unit_grid_validation_status_reset ON flex.controllable_unit;
DROP FUNCTION IF EXISTS
controllable_unit_grid_validation_status_reset();
DROP TRIGGER IF EXISTS
controllable_unit_grid_validation_status_approved ON flex.controllable_unit;
DROP FUNCTION IF EXISTS
controllable_unit_grid_validation_status_approved();


-- changeset flex:controllable-unit-grid-validation-drop-columns runOnChange:false endDelimiter:--
ALTER TABLE flex.controllable_unit
DROP COLUMN IF EXISTS grid_validation_status CASCADE,
DROP COLUMN IF EXISTS grid_validation_notes CASCADE,
DROP COLUMN IF EXISTS validated_at CASCADE;
ALTER TABLE flex.controllable_unit_history
DROP COLUMN IF EXISTS grid_validation_status,
DROP COLUMN IF EXISTS grid_validation_notes,
DROP COLUMN IF EXISTS validated_at;


-- changeset flex:controllable-unit-ramp-rate-minimum-duration-maximum-duration-recovery-duration-drop runOnChange:false endDelimiter:--
ALTER TABLE flex.controllable_unit
DROP COLUMN IF EXISTS ramp_rate CASCADE,
DROP COLUMN IF EXISTS minimum_duration CASCADE,
DROP COLUMN IF EXISTS maximum_duration CASCADE,
DROP COLUMN IF EXISTS recovery_duration CASCADE;
ALTER TABLE flex.controllable_unit_history
DROP COLUMN IF EXISTS ramp_rate,
DROP COLUMN IF EXISTS minimum_duration,
DROP COLUMN IF EXISTS maximum_duration,
DROP COLUMN IF EXISTS recovery_duration;


-- changeset flex:controllable-unit-grid-node-id-drop runOnChange:false endDelimiter:--
ALTER TABLE flex.controllable_unit
DROP COLUMN IF EXISTS grid_node_id CASCADE;
ALTER TABLE flex.controllable_unit_history
DROP COLUMN IF EXISTS grid_node_id;

-- changeset flex:controllable-unit-additional-information-add runOnChange:false endDelimiter:--
ALTER TABLE flex.controllable_unit
ADD COLUMN IF NOT EXISTS additional_information text;
ALTER TABLE flex.controllable_unit_history
ADD COLUMN IF NOT EXISTS additional_information text;
