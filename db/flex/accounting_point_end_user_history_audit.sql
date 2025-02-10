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
accounting_point_end_user_history
BEFORE INSERT OR UPDATE OR DELETE
ON accounting_point_end_user
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.accounting_point_end_user_history',
    true
);

CREATE OR REPLACE TRIGGER
accounting_point_end_user_replaced_by
BEFORE INSERT ON accounting_point_end_user_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS accounting_point_end_user_history
ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER
accounting_point_end_user_recorded_by
BEFORE INSERT OR UPDATE ON accounting_point_end_user
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
