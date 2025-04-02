--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:system-operator-product-type-history-table-create endDelimiter:--
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

-- changeset flex:system-operator-product-type-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
system_operator_product_type_history_id_idx
ON flex.system_operator_product_type_history (id);

-- changeset flex:system-operator-product-type-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.system_operator_product_type_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:system-operator-product-type-history-rls-com endDelimiter:--
-- RLS: SOPT-COM001
GRANT SELECT ON system_operator_product_type_history
TO flex_common;
CREATE POLICY "SOPT_COM001"
ON system_operator_product_type_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM system_operator_product_type
    WHERE system_operator_product_type_history.id = system_operator_product_type.id -- noqa
));

-- changeset flex:system-operator-product-type-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
system_operator_product_type_audit_current
BEFORE INSERT OR UPDATE
ON flex.system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:system-operator-product-type-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
system_operator_product_type_audit_history
AFTER UPDATE OR DELETE
ON flex.system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
