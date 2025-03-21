-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
notification_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.notification',
            'id'
        )
    ),
    LIKE notification,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
notification_history_id_idx
ON notification_history (id);

CREATE OR REPLACE TRIGGER
notification_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON notification
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
notification_audit_current
BEFORE INSERT OR UPDATE ON notification
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
