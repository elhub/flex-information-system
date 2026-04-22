--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:accounting-point-grid-location-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.accounting_point_grid_location_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.accounting_point_grid_location',
            'id'
        )
    ),
    LIKE flex.accounting_point_grid_location,
    replaced_by bigint NOT NULL
);

-- changeset flex:accounting-point-grid-location-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
accounting_point_grid_location_history_id_idx
ON flex.accounting_point_grid_location_history (id);

-- changeset flex:accounting-point-grid-location-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.accounting_point_grid_location_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:accounting-point-grid-location-history-rls-com runAlways:true endDelimiter:--
-- RLS: APGL-COM001
GRANT SELECT ON flex.accounting_point_grid_location_history
TO flex_common;

CREATE POLICY "APGL_COM001"
ON flex.accounting_point_grid_location_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM accounting_point_grid_location
    WHERE accounting_point_grid_location_history.id = accounting_point_grid_location.id -- noqa
));

-- changeset flex:accounting-point-grid-location-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
accounting_point_grid_location_audit_current
BEFORE INSERT OR UPDATE
ON flex.accounting_point_grid_location
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:accounting-point-grid-location-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
accounting_point_grid_location_audit_history
AFTER UPDATE OR DELETE
ON flex.accounting_point_grid_location
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
