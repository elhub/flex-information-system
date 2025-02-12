-- manually edited file
CREATE TABLE IF NOT EXISTS accounting_point_balance_responsible_party_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point_balance_responsible_party',
            'id'
        )
    ),
    LIKE accounting_point_balance_responsible_party,
    replaced_by bigint NOT NULL
);

CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_history
BEFORE INSERT OR UPDATE OR DELETE
ON accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.accounting_point_balance_responsible_party_history',
    true
);

CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_replaced_by
BEFORE INSERT ON accounting_point_balance_responsible_party_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS accounting_point_balance_responsible_party_history
ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_recorded_by
BEFORE INSERT OR UPDATE ON accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
