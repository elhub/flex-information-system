--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-membership-history-table-create
CREATE TABLE IF NOT EXISTS
flex.service_providing_group_membership_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_membership',
            'id'
        )
    ),
    LIKE flex.service_providing_group_membership,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-providing-group-membership-history-id-index
CREATE INDEX IF NOT EXISTS
service_providing_group_membership_history_id_idx
ON flex.service_providing_group_membership_history (id);

-- changeset flex:service-providing-group-membership-history-rls
ALTER TABLE IF EXISTS
flex.service_providing_group_membership_history
ENABLE ROW LEVEL SECURITY;
