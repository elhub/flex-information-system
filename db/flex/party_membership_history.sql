--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:party-membership-history-table-create
CREATE TABLE IF NOT EXISTS
flex.party_membership_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party_membership',
            'id'
        )
    ),
    LIKE flex.party_membership,
    replaced_by bigint NOT NULL
);

-- changeset flex:party-membership-history-id-index
CREATE INDEX IF NOT EXISTS
party_membership_history_id_idx
ON flex.party_membership_history (id);

-- changeset flex:party-membership-history-rls
ALTER TABLE IF EXISTS
flex.party_membership_history
ENABLE ROW LEVEL SECURITY;
