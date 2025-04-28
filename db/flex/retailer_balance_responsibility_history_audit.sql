--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:retailer-balance-responsibility-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.retailer_balance_responsibility_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.retailer_balance_responsibility',
            'id'
        )
    ),
    LIKE flex.retailer_balance_responsibility,
    replaced_by bigint NOT NULL
);

-- changeset flex:retailer-balance-responsibility-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
retailer_balance_responsibility_history_id_idx
ON flex.retailer_balance_responsibility_history (id);

-- changeset flex:retailer-balance-responsibility-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.retailer_balance_responsibility_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:retailer-balance-responsibility-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
retailer_balance_responsibility_audit_current
BEFORE INSERT OR UPDATE
ON flex.retailer_balance_responsibility
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:retailer-balance-responsibility-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
retailer_balance_responsibility_audit_history
AFTER UPDATE OR DELETE
ON flex.retailer_balance_responsibility
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
