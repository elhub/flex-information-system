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
notification_history
BEFORE INSERT OR UPDATE OR DELETE
ON notification
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.notification_history',
    true
);

CREATE OR REPLACE TRIGGER
notification_replaced_by
BEFORE INSERT ON notification_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

CREATE OR REPLACE TRIGGER
notification_recorded_by
BEFORE INSERT OR UPDATE ON notification
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
