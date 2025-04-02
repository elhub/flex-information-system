--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:controllable-unit-service-provider-history-table-create
CREATE TABLE IF NOT EXISTS
flex.controllable_unit_service_provider_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit_service_provider',
            'id'
        )
    ),
    LIKE flex.controllable_unit_service_provider,
    replaced_by bigint NOT NULL
);

-- changeset flex:controllable-unit-service-provider-history-id-index
CREATE INDEX IF NOT EXISTS
controllable_unit_service_provider_history_id_idx
ON flex.controllable_unit_service_provider_history (id);

-- changeset flex:controllable-unit-service-provider-history-rls
ALTER TABLE IF EXISTS
flex.controllable_unit_service_provider_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:controllable-unit-service-provider-audit-current
CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_audit_current
BEFORE INSERT OR UPDATE
ON flex.controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:controllable-unit-service-provider-audit-history
CREATE OR REPLACE TRIGGER
controllable_unit_service_provider_audit_history
AFTER UPDATE OR DELETE
ON flex.controllable_unit_service_provider
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
