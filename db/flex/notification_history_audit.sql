-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE TRIGGER
notification_recorded_by
BEFORE INSERT OR UPDATE ON notification
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
