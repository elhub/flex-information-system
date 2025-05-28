--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-metering-grid-area runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS accounting_point_metering_grid_area (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    accounting_point_id bigint NOT NULL,
    metering_grid_area_id bigint NOT NULL,
    valid_time_range tstzrange CHECK (
        valid_time_range IS null OR (
            lower(valid_time_range) IS NOT null
            AND lower_inc(valid_time_range)
            AND NOT upper_inc(valid_time_range)
        )
    ),
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),

    CONSTRAINT fk_accounting_point_mga_accounting_point FOREIGN KEY (
        accounting_point_id
    ) REFERENCES accounting_point (id),
    CONSTRAINT fk_accounting_point_mga_metering_grid_area FOREIGN KEY (
        metering_grid_area_id
    ) REFERENCES metering_grid_area (id),
    CONSTRAINT accounting_point_mga_valid_time_overlap
    EXCLUDE USING gist (
        accounting_point_id WITH =, valid_time_range WITH &&
    ) WHERE (valid_time_range IS NOT null)
);

-- changeset flex:accounting-point-metering-grid-area-timeline-midnight-aligned runOnChange:true endDelimiter:--
CREATE OR REPLACE TRIGGER accounting_point_mga_timeline_midnight_aligned
AFTER INSERT OR UPDATE ON accounting_point_metering_grid_area
FOR EACH ROW
EXECUTE FUNCTION timeline.midnight_aligned();

-- changeset flex:accounting-point-metering-grid-area-accounting-point-idx runOnChange:true endDelimiter:-- runInTransaction:false
CREATE INDEX CONCURRENTLY IF NOT EXISTS
accounting_point_metering_grid_area_accounting_point_idx
ON accounting_point_metering_grid_area (accounting_point_id);
