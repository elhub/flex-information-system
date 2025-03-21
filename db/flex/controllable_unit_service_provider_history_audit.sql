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

CREATE INDEX IF NOT EXISTS
controllable_unit_service_provider_history_id_idx
ON controllable_unit_service_provider_history (id);

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_audit_current
BEFORE INSERT OR UPDATE ON controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
