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
accounting_point_balance_responsible_party_audit_current
BEFORE INSERT OR UPDATE
ON accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_audit_history
AFTER UPDATE OR DELETE
ON accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS accounting_point_balance_responsible_party_history
ENABLE ROW LEVEL SECURITY;
