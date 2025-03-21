-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
service_providing_group_product_application_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_product_application',
            'id'
        )
    ),
    LIKE service_providing_group_product_application,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
service_providing_group_product_application_history_id_idx
ON service_providing_group_product_application_history (id);

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON service_providing_group_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS service_providing_group_product_application_history
ENABLE ROW LEVEL SECURITY;

-- RLS: SPGPA-COM001
GRANT SELECT ON service_providing_group_product_application_history
TO flex_common;
CREATE POLICY "SPGPA_COM001"
ON service_providing_group_product_application_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group_product_application
    WHERE service_providing_group_product_application_history.id = service_providing_group_product_application.id -- noqa
));

CREATE OR REPLACE TRIGGER
service_providing_group_product_application_audit_current
BEFORE INSERT OR UPDATE ON service_providing_group_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
