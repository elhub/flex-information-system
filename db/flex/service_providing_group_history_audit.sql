-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
service_providing_group_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group',
            'id'
        )
    ),
    LIKE service_providing_group,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
service_providing_group_history_id_idx
ON service_providing_group_history (id);

CREATE OR REPLACE TRIGGER
service_providing_group_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON service_providing_group
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS service_providing_group_history
ENABLE ROW LEVEL SECURITY;

-- RLS: SPG-COM001
GRANT SELECT ON service_providing_group_history
TO flex_common;
CREATE POLICY "SPG_COM001"
ON service_providing_group_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group
    WHERE service_providing_group_history.id = service_providing_group.id -- noqa
));

CREATE OR REPLACE TRIGGER
service_providing_group_audit_current
BEFORE INSERT OR UPDATE ON service_providing_group
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
