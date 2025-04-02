--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:party-history-table-create
CREATE TABLE IF NOT EXISTS
flex.party_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party',
            'id'
        )
    ),
    LIKE flex.party,
    replaced_by bigint NOT NULL
);

-- changeset flex:party-history-id-index
CREATE INDEX IF NOT EXISTS
party_history_id_idx
ON flex.party_history (id);

-- changeset flex:party-history-rls
ALTER TABLE IF EXISTS
flex.party_history
ENABLE ROW LEVEL SECURITY;
