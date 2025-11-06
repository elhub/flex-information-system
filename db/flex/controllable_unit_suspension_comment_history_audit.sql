--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:controllable-unit-suspension-comment-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.controllable_unit_suspension_comment_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit_suspension_comment',
            'id'
        )
    ),
    LIKE flex.controllable_unit_suspension_comment,
    replaced_by bigint NOT NULL
);

-- changeset flex:controllable-unit-suspension-comment-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
controllable_unit_suspension_comment_history_id_idx
ON flex.controllable_unit_suspension_comment_history (id);

-- changeset flex:controllable-unit-suspension-comment-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.controllable_unit_suspension_comment_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:controllable-unit-suspension-comment-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_comment_audit_current
BEFORE INSERT OR UPDATE
ON flex.controllable_unit_suspension_comment
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:controllable-unit-suspension-comment-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
controllable_unit_suspension_comment_audit_history
AFTER UPDATE OR DELETE
ON flex.controllable_unit_suspension_comment
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
