--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:entity-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.entity_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.entity',
            'id'
        )
    ),
    LIKE flex.entity,
    replaced_by bigint NOT NULL
);

-- changeset flex:entity-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
entity_history_id_idx
ON flex.entity_history (id);

-- changeset flex:entity-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.entity_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:entity-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
entity_audit_current
BEFORE INSERT OR UPDATE
ON flex.entity
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:entity-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
entity_audit_history
AFTER UPDATE OR DELETE
ON flex.entity
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
