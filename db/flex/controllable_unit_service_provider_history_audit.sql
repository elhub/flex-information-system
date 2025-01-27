-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
controllable_unit_service_provider_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit_service_provider',
            'id'
        )
    ),
    LIKE controllable_unit_service_provider,
    replaced_by bigint NOT NULL
);

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_history
BEFORE INSERT OR UPDATE OR DELETE
ON controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.controllable_unit_service_provider_history',
    true
);

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_replaced_by
BEFORE INSERT ON controllable_unit_service_provider_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS controllable_unit_service_provider_history
ENABLE ROW LEVEL SECURITY;

-- RLS: CUSP-COM001
GRANT SELECT ON controllable_unit_service_provider_history
TO flex_common;
CREATE POLICY "CUSP_COM001"
ON controllable_unit_service_provider_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM controllable_unit_service_provider
    WHERE controllable_unit_service_provider_history.id = controllable_unit_service_provider.id -- noqa
));

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_recorded_by
BEFORE INSERT OR UPDATE ON controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
