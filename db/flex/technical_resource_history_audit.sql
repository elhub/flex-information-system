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
technical_resource_history
BEFORE INSERT OR UPDATE OR DELETE
ON technical_resource
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.technical_resource_history',
    true
);

CREATE OR REPLACE TRIGGER
technical_resource_replaced_by
BEFORE INSERT ON technical_resource_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS technical_resource_history
ENABLE ROW LEVEL SECURITY;

-- RLS: TR-COM001
GRANT SELECT ON technical_resource_history
TO flex_common;
CREATE POLICY "TR_COM001"
ON technical_resource_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM technical_resource
    WHERE technical_resource_history.id = technical_resource.id -- noqa
));

CREATE OR REPLACE TRIGGER
technical_resource_recorded_by
BEFORE INSERT OR UPDATE ON technical_resource
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
