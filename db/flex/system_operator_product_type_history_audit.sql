-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
system_operator_product_type_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.system_operator_product_type',
            'id'
        )
    ),
    LIKE system_operator_product_type,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
system_operator_product_type_history_id_idx
ON system_operator_product_type_history (id);

CREATE OR REPLACE TRIGGER
system_operator_product_type_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS system_operator_product_type_history
ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE TRIGGER
system_operator_product_type_audit_current
BEFORE INSERT OR UPDATE ON system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
