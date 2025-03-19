-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE TRIGGER
entity_client_recorded_by
BEFORE INSERT OR UPDATE ON entity_client
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
