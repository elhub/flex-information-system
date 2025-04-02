--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:technical-resource-history-table-create
CREATE TABLE IF NOT EXISTS
flex.technical_resource_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.technical_resource',
            'id'
        )
    ),
    LIKE flex.technical_resource,
    replaced_by bigint NOT NULL
);

-- changeset flex:technical-resource-history-id-index
CREATE INDEX IF NOT EXISTS
technical_resource_history_id_idx
ON flex.technical_resource_history (id);

-- changeset flex:technical-resource-history-rls
ALTER TABLE IF EXISTS
flex.technical_resource_history
ENABLE ROW LEVEL SECURITY;
