-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.party_audit_current
BEFORE INSERT OR UPDATE
ON flex.party
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.party_audit_history
AFTER UPDATE OR DELETE
ON flex.party
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
