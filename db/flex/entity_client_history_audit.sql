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
entity_client_history
BEFORE INSERT OR UPDATE OR DELETE
ON entity_client
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.entity_client_history',
    true
);

CREATE OR REPLACE TRIGGER
entity_client_replaced_by
BEFORE INSERT ON entity_client_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

CREATE OR REPLACE TRIGGER
entity_client_recorded_by
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
