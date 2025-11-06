--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:controllable-unit-suspension-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.controllable_unit_suspension_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit_suspension',
            'id'
        )
    ),
    LIKE flex.controllable_unit_suspension,
    replaced_by bigint NOT NULL
);

-- changeset flex:controllable-unit-suspension-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
controllable_unit_suspension_history_id_idx
ON flex.controllable_unit_suspension_history (id);

-- changeset flex:controllable-unit-suspension-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.controllable_unit_suspension_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:controllable-unit-suspension-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_audit_current
BEFORE INSERT OR UPDATE
ON flex.controllable_unit_suspension
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:controllable-unit-suspension-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_audit_history
AFTER UPDATE OR DELETE
ON flex.controllable_unit_suspension
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
