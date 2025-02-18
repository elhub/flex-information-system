-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
service_providing_group_grid_prequalification_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_grid_prequalification',
            'id'
        )
    ),
    LIKE service_providing_group_grid_prequalification,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
service_providing_group_grid_prequalification_history_id_idx
ON service_providing_group_grid_prequalification_history (id);

CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_history
BEFORE INSERT OR UPDATE OR DELETE
ON service_providing_group_grid_prequalification
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.service_providing_group_grid_prequalification_history',
    true
);

CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_replaced_by
BEFORE INSERT ON service_providing_group_grid_prequalification_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS service_providing_group_grid_prequalification_history
ENABLE ROW LEVEL SECURITY;

-- RLS: SPGGP-COM001
GRANT SELECT ON service_providing_group_grid_prequalification_history
TO flex_common;
CREATE POLICY "SPGGP_COM001"
ON service_providing_group_grid_prequalification_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_providing_group_grid_prequalification
    WHERE service_providing_group_grid_prequalification_history.id = service_providing_group_grid_prequalification.id -- noqa
));

CREATE OR REPLACE TRIGGER
service_providing_group_grid_prequalification_recorded_by
BEFORE INSERT OR UPDATE ON service_providing_group_grid_prequalification
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
