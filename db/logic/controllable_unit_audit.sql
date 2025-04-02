-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.controllable_unit_audit_current
BEFORE INSERT OR UPDATE
ON flex.controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.controllable_unit_audit_history
AFTER UPDATE OR DELETE
ON flex.controllable_unit
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
