--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-suspension-create runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS controllable_unit_suspension (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    impacted_system_operator_id bigint NOT NULL DEFAULT (flex.current_party()),
    impacted_system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    controllable_unit_id bigint NOT NULL,
    reason text NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT controllable_unit_suspension_reason_check CHECK (
        reason IN (
            'compromises_safe_operation',
            'other'
        )
    ),
    CONSTRAINT controllable_unit_suspension_system_operator_fkey
    FOREIGN KEY (
        impacted_system_operator_id, impacted_system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT
    controllable_unit_suspension_controllable_unit_fkey
    FOREIGN KEY (controllable_unit_id)
    REFERENCES controllable_unit (id)
);

-- changeset flex:controllable-unit-suspension-cu-status-insert-function runOnChange:true endDelimiter:--
-- trigger to check that the CU is active
CREATE OR REPLACE FUNCTION
controllable_unit_suspension_cu_status_insert()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE
            cu.id = NEW.controllable_unit_id
            AND cu.status = 'active'
    ) THEN
        RAISE sqlstate 'PT400' using
            message = 'controllable unit is not active';
        RETURN null;
    END IF;

    RETURN NEW;
END;
$$;

-- changeset flex:controllable-unit-suspension-cu-iso-uk runOnChange:true endDelimiter:--
-- ensure only one active suspension per ISO per CU
CREATE UNIQUE INDEX IF NOT EXISTS
uk_controllable_unit_suspension_iso_cu
ON controllable_unit_suspension (
    impacted_system_operator_id,
    controllable_unit_id
);

-- changeset flex:controllable-unit-suspension-cu-status-insert-trigger runOnChange:true endDelimiter:--
-- CUS-VAL001
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_cu_status_insert
BEFORE INSERT OR UPDATE ON controllable_unit_suspension
FOR EACH ROW
EXECUTE FUNCTION
controllable_unit_suspension_cu_status_insert();

-- changeset flex:controllable-unit-suspension-capture-event runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER controllable_unit_suspension_event
AFTER INSERT OR UPDATE OR DELETE ON controllable_unit_suspension
FOR EACH ROW
EXECUTE FUNCTION capture_event('controllable_unit');
