-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
controllable_unit_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.controllable_unit',
            'id'
        )
    ),
    LIKE controllable_unit,
    replaced_by bigint NOT NULL
);

CREATE OR REPLACE TRIGGER
controllable_unit_history
BEFORE INSERT OR UPDATE OR DELETE
ON controllable_unit
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.controllable_unit_history',
    true
);

CREATE OR REPLACE TRIGGER
controllable_unit_replaced_by
BEFORE INSERT ON controllable_unit_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

CREATE OR REPLACE TRIGGER
controllable_unit_recorded_by
BEFORE INSERT OR UPDATE ON controllable_unit
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
