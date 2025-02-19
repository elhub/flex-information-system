-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS accounting_point_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence('flex.accounting_point', 'id')
    ),
    LIKE accounting_point,
    replaced_by bigint NOT NULL
);

CREATE OR REPLACE TRIGGER accounting_point_history
BEFORE INSERT OR UPDATE OR DELETE ON accounting_point
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range', 'flex.accounting_point_history', true
);

CREATE OR REPLACE TRIGGER accounting_point_replaced_by
BEFORE INSERT ON accounting_point_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS accounting_point_history
ENABLE ROW LEVEL SECURITY;

-- RLS: AP-COM001
GRANT SELECT ON accounting_point_history TO flex_common;
CREATE POLICY "AP_COM001" ON accounting_point_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM accounting_point
    WHERE accounting_point_history.id = accounting_point.id -- noqa
));
