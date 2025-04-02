-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.technical_resource_audit_current
BEFORE INSERT OR UPDATE
ON flex.technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.technical_resource_audit_history
AFTER UPDATE OR DELETE
ON flex.technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
