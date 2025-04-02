-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.notification_audit_current
BEFORE INSERT OR UPDATE
ON flex.notification
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
