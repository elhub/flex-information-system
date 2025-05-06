--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:energy-supplier-balance-responsibility-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.energy_supplier_balance_responsibility_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.energy_supplier_balance_responsibility',
            'id'
        )
    ),
    LIKE flex.energy_supplier_balance_responsibility,
    replaced_by bigint NOT NULL
);

-- changeset flex:energy-supplier-balance-responsibility-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
energy_supplier_balance_responsibility_history_id_idx
ON flex.energy_supplier_balance_responsibility_history (id);

-- changeset flex:energy-supplier-balance-responsibility-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.energy_supplier_balance_responsibility_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:energy-supplier-balance-responsibility-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
energy_supplier_balance_responsibility_audit_current
BEFORE INSERT OR UPDATE
ON flex.energy_supplier_balance_responsibility
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:energy-supplier-balance-responsibility-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
energy_supplier_balance_responsibility_audit_history
AFTER UPDATE OR DELETE
ON flex.energy_supplier_balance_responsibility
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
