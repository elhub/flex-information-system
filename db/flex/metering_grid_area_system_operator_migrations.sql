--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-system-operator-init runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM metering_grid_area_system_operator
INSERT INTO metering_grid_area_system_operator (
    metering_grid_area_id,
    system_operator_id,
    valid_time_range,
    recorded_by
)
SELECT
    id AS metering_grid_area_id,
    system_operator_id,
    valid_time_range,
    recorded_by
FROM flex.metering_grid_area;
