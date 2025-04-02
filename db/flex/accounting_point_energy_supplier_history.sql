--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:accounting-point-energy-supplier-history-table-create
CREATE TABLE IF NOT EXISTS
flex.accounting_point_energy_supplier_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point_energy_supplier',
            'id'
        )
    ),
    LIKE flex.accounting_point_energy_supplier,
    replaced_by bigint NOT NULL
);

-- changeset flex:accounting-point-energy-supplier-history-id-index
CREATE INDEX IF NOT EXISTS
accounting_point_energy_supplier_history_id_idx
ON flex.accounting_point_energy_supplier_history (id);

-- changeset flex:accounting-point-energy-supplier-history-rls
ALTER TABLE IF EXISTS
flex.accounting_point_energy_supplier_history
ENABLE ROW LEVEL SECURITY;
