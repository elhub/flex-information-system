-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
entity_client_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.entity_client',
            'id'
        )
    ),
    LIKE entity_client,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
entity_client_history_id_idx
ON entity_client_history (id);

CREATE OR REPLACE TRIGGER
entity_client_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON entity_client
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

CREATE OR REPLACE TRIGGER
entity_client_audit_current
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
