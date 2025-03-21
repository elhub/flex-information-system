-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
technical_resource_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.technical_resource',
            'id'
        )
    ),
    LIKE technical_resource,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
technical_resource_history_id_idx
ON technical_resource_history (id);

CREATE OR REPLACE TRIGGER
technical_resource_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
technical_resource_audit_current
BEFORE INSERT OR UPDATE ON technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
