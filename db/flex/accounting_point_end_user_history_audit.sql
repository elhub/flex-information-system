-- manually edited file
CREATE TABLE IF NOT EXISTS accounting_point_end_user_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point_end_user',
            'id'
        )
    ),
    LIKE accounting_point_end_user,
    replaced_by bigint NOT NULL
);

CREATE OR REPLACE TRIGGER
accounting_point_end_user_audit_current
BEFORE INSERT OR UPDATE
ON accounting_point_end_user
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
accounting_point_end_user_audit_history
AFTER UPDATE OR DELETE
ON accounting_point_end_user
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS accounting_point_end_user_history
ENABLE ROW LEVEL SECURITY;
