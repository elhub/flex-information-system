-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
controllable_unit_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit',
            'id'
        )
    ),
    LIKE controllable_unit,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
controllable_unit_history_id_idx
ON controllable_unit_history (id);

CREATE OR REPLACE TRIGGER
controllable_unit_audit_current
BEFORE INSERT OR UPDATE
ON controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
controllable_unit_audit_history
AFTER UPDATE OR DELETE
ON controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
