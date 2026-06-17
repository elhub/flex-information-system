--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:substation-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.substation_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.substation',
            'id'
        )
    ),
    LIKE flex.substation,
    replaced_by bigint NOT NULL
);

-- changeset flex:substation-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
substation_history_id_idx
ON flex.substation_history (id);

-- changeset flex:substation-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.substation_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:substation-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
substation_audit_current
BEFORE INSERT OR UPDATE
ON flex.substation
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:substation-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
substation_audit_history
AFTER UPDATE OR DELETE
ON flex.substation
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
