--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:accounting-point-balance-responsible-party-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.accounting_point_balance_responsible_party_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point_balance_responsible_party',
            'id'
        )
    ),
    LIKE flex.accounting_point_balance_responsible_party,
    replaced_by bigint NOT NULL
);

-- changeset flex:accounting-point-balance-responsible-party-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
accounting_point_balance_responsible_party_history_id_idx
ON flex.accounting_point_balance_responsible_party_history (id);

-- changeset flex:accounting-point-balance-responsible-party-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.accounting_point_balance_responsible_party_history
ENABLE ROW LEVEL SECURITY;



-- changeset flex:accounting-point-balance-responsible-party-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_audit_current
BEFORE INSERT OR UPDATE
ON flex.accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:accounting-point-balance-responsible-party-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
accounting_point_balance_responsible_party_audit_history
AFTER UPDATE OR DELETE
ON flex.accounting_point_balance_responsible_party
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
