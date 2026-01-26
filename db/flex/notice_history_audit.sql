--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:notice-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.notice_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.notice',
            'id'
        )
    ),
    LIKE flex.notice,
    replaced_by bigint NOT NULL
);

-- changeset flex:notice-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
notice_history_id_idx
ON flex.notice_history (id);

-- changeset flex:notice-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.notice_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:notice-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
notice_audit_current
BEFORE INSERT OR UPDATE
ON flex.notice
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:notice-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
notice_audit_history
AFTER UPDATE OR DELETE
ON flex.notice
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
