-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
service_provider_product_application_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_provider_product_application',
            'id'
        )
    ),
    LIKE service_provider_product_application,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
service_provider_product_application_history_id_idx
ON service_provider_product_application_history (id);

CREATE OR REPLACE TRIGGER
service_provider_product_application_history
BEFORE INSERT OR UPDATE OR DELETE
ON service_provider_product_application
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.service_provider_product_application_history',
    true
);

CREATE OR REPLACE TRIGGER
service_provider_product_application_replaced_by
BEFORE INSERT ON service_provider_product_application_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS service_provider_product_application_history
ENABLE ROW LEVEL SECURITY;

-- RLS: SPPA-COM001
GRANT SELECT ON service_provider_product_application_history
TO flex_common;
CREATE POLICY "SPPA_COM001"
ON service_provider_product_application_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_provider_product_application
    WHERE service_provider_product_application_history.id = service_provider_product_application.id -- noqa
));

CREATE OR REPLACE TRIGGER
service_provider_product_application_recorded_by
BEFORE INSERT OR UPDATE ON service_provider_product_application
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
