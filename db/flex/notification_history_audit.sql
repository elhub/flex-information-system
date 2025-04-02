--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:notification-history-table-create
CREATE TABLE IF NOT EXISTS
flex.notification_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.notification',
            'id'
        )
    ),
    LIKE flex.notification,
    replaced_by bigint NOT NULL
);

-- changeset flex:notification-history-id-index
CREATE INDEX IF NOT EXISTS
notification_history_id_idx
ON flex.notification_history (id);

-- changeset flex:notification-history-rls
ALTER TABLE IF EXISTS
flex.notification_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:notification-audit-current
CREATE OR REPLACE TRIGGER
notification_audit_current
BEFORE INSERT OR UPDATE
ON flex.notification
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:notification-audit-history
CREATE OR REPLACE TRIGGER
notification_audit_history
AFTER UPDATE OR DELETE
ON flex.notification
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
