--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-history-table-create
CREATE TABLE IF NOT EXISTS
flex.service_providing_group_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group',
            'id'
        )
    ),
    LIKE flex.service_providing_group,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-providing-group-history-id-index
CREATE INDEX IF NOT EXISTS
service_providing_group_history_id_idx
ON flex.service_providing_group_history (id);

-- changeset flex:service-providing-group-history-rls
ALTER TABLE IF EXISTS
flex.service_providing_group_history
ENABLE ROW LEVEL SECURITY;
