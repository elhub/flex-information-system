-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.service_providing_group_membership_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
logic.service_providing_group_membership_audit_history
AFTER UPDATE OR DELETE
ON flex.service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
