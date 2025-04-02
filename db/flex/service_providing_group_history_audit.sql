--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-history-table-create endDelimiter:--
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

-- changeset flex:service-providing-group-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
service_providing_group_history_id_idx
ON flex.service_providing_group_history (id);

-- changeset flex:service-providing-group-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.service_providing_group_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:service-providing-group-history-rls-com endDelimiter:--
-- RLS: SPG-COM001
GRANT SELECT ON flex.service_providing_group_history
TO flex_common;

CREATE POLICY "SPG_COM001"
ON flex.service_providing_group_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group
    WHERE service_providing_group_history.id = service_providing_group.id -- noqa
));

-- changeset flex:service-providing-group-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_providing_group
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:service-providing-group-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_audit_history
AFTER UPDATE OR DELETE
ON flex.service_providing_group
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
