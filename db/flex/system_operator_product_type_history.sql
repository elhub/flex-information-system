--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:system-operator-product-type-history-table-create
CREATE TABLE IF NOT EXISTS
flex.system_operator_product_type_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.system_operator_product_type',
            'id'
        )
    ),
    LIKE flex.system_operator_product_type,
    replaced_by bigint NOT NULL
);

-- changeset flex:system-operator-product-type-history-id-index
CREATE INDEX IF NOT EXISTS
system_operator_product_type_history_id_idx
ON flex.system_operator_product_type_history (id);

-- changeset flex:system-operator-product-type-history-rls
ALTER TABLE IF EXISTS
flex.system_operator_product_type_history
ENABLE ROW LEVEL SECURITY;
