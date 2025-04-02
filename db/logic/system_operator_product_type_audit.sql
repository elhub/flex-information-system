-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.system_operator_product_type_audit_current
BEFORE INSERT OR UPDATE
ON flex.system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.system_operator_product_type_audit_history
AFTER UPDATE OR DELETE
ON flex.system_operator_product_type
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
