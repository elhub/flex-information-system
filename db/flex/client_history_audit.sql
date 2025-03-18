-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE TRIGGER
client_recorded_by
BEFORE INSERT OR UPDATE ON client
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
