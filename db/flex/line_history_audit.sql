--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:line-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.line_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.line',
            'id'
        )
    ),
    LIKE flex.line,
    replaced_by bigint NOT NULL
);

-- changeset flex:line-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
line_history_id_idx
ON flex.line_history (id);

-- changeset flex:line-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.line_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:line-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
line_audit_current
BEFORE INSERT OR UPDATE
ON flex.line
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:line-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
line_audit_history
AFTER UPDATE OR DELETE
ON flex.line
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
