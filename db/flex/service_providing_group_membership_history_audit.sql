--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-membership-history-table-create endDelimiter:--
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

-- changeset flex:service-providing-group-membership-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
service_providing_group_membership_history_id_idx
ON flex.service_providing_group_membership_history (id);

-- changeset flex:service-providing-group-membership-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.service_providing_group_membership_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:service-providing-group-membership-history-rls-com endDelimiter:--
-- RLS: SPGM-COM001
GRANT SELECT ON flex.service_providing_group_membership_history
TO flex_common;

CREATE POLICY "SPGM_COM001"
ON flex.service_providing_group_membership_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group_membership
    WHERE service_providing_group_membership_history.id = service_providing_group_membership.id -- noqa
));

-- changeset flex:service-providing-group-membership-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_membership_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:service-providing-group-membership-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_membership_audit_history
AFTER UPDATE OR DELETE
ON flex.service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
