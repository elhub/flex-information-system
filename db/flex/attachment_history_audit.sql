--liquibase formatted sql
-- Manually managed file

-- changeset flex:attachment-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.attachment_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.attachment',
            'id'
        )
    ),
    LIKE flex.attachment,
    replaced_by bigint NOT NULL
);

-- changeset flex:attachment-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
attachment_history_id_idx
ON flex.attachment_history (id);

-- changeset flex:attachment-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.attachment_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:attachment-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
attachment_audit_current
BEFORE INSERT OR UPDATE
ON flex.attachment
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:attachment-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
attachment_audit_history
AFTER UPDATE OR DELETE
ON flex.attachment
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
