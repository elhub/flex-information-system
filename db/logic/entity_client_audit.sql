-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.entity_client_audit_current
BEFORE INSERT OR UPDATE
ON flex.entity_client
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
