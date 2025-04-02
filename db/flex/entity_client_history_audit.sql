--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:entity-client-history-table-create
CREATE TABLE IF NOT EXISTS
flex.entity_client_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.entity_client',
            'id'
        )
    ),
    LIKE flex.entity_client,
    replaced_by bigint NOT NULL
);

-- changeset flex:entity-client-history-id-index
CREATE INDEX IF NOT EXISTS
entity_client_history_id_idx
ON flex.entity_client_history (id);

-- changeset flex:entity-client-history-rls
ALTER TABLE IF EXISTS
flex.entity_client_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:entity-client-audit-current
CREATE OR REPLACE TRIGGER
entity_client_audit_current
BEFORE INSERT OR UPDATE
ON flex.entity_client
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:entity-client-audit-history
CREATE OR REPLACE TRIGGER
entity_client_audit_history
AFTER UPDATE OR DELETE
ON flex.entity_client
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
