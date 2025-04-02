--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:controllable-unit-history-table-create
CREATE TABLE IF NOT EXISTS
flex.controllable_unit_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit',
            'id'
        )
    ),
    LIKE flex.controllable_unit,
    replaced_by bigint NOT NULL
);

-- changeset flex:controllable-unit-history-id-index
CREATE INDEX IF NOT EXISTS
controllable_unit_history_id_idx
ON flex.controllable_unit_history (id);

-- changeset flex:controllable-unit-history-rls
ALTER TABLE IF EXISTS
flex.controllable_unit_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:controllable-unit-audit-current
CREATE OR REPLACE TRIGGER
controllable_unit_audit_current
BEFORE INSERT OR UPDATE
ON flex.controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:controllable-unit-audit-history
CREATE OR REPLACE TRIGGER
controllable_unit_audit_history
AFTER UPDATE OR DELETE
ON flex.controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
