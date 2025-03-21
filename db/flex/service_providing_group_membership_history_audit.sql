-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
service_providing_group_membership_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_membership',
            'id'
        )
    ),
    LIKE service_providing_group_membership,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
service_providing_group_membership_history_id_idx
ON service_providing_group_membership_history (id);

CREATE OR REPLACE TRIGGER
service_providing_group_membership_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS service_providing_group_membership_history
ENABLE ROW LEVEL SECURITY;

-- RLS: SPGM-COM001
GRANT SELECT ON service_providing_group_membership_history
TO flex_common;
CREATE POLICY "SPGM_COM001"
ON service_providing_group_membership_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group_membership
    WHERE service_providing_group_membership_history.id = service_providing_group_membership.id -- noqa
));

CREATE OR REPLACE TRIGGER
service_providing_group_membership_audit_current
BEFORE INSERT OR UPDATE ON service_providing_group_membership
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
