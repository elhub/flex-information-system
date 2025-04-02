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
