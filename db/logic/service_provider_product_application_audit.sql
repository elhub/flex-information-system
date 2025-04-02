-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.service_provider_product_application_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_provider_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.service_provider_product_application_audit_history
AFTER UPDATE OR DELETE
ON flex.service_provider_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
