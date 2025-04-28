--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:metering-grid-area-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.metering_grid_area_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.metering_grid_area',
            'id'
        )
    ),
    LIKE flex.metering_grid_area,
    replaced_by bigint NOT NULL
);

-- changeset flex:metering-grid-area-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
metering_grid_area_history_id_idx
ON flex.metering_grid_area_history (id);

-- changeset flex:metering-grid-area-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.metering_grid_area_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:metering-grid-area-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
metering_grid_area_audit_current
BEFORE INSERT OR UPDATE
ON flex.metering_grid_area
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:metering-grid-area-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
metering_grid_area_audit_history
AFTER UPDATE OR DELETE
ON flex.metering_grid_area
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
