--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:accounting-point-history-table-create
CREATE TABLE IF NOT EXISTS
flex.accounting_point_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point',
            'id'
        )
    ),
    LIKE flex.accounting_point,
    replaced_by bigint NOT NULL
);

-- changeset flex:accounting-point-history-id-index
CREATE INDEX IF NOT EXISTS
accounting_point_history_id_idx
ON flex.accounting_point_history (id);

-- changeset flex:accounting-point-history-rls
ALTER TABLE IF EXISTS
flex.accounting_point_history
ENABLE ROW LEVEL SECURITY;
