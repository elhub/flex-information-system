--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-price-area-init runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM metering_grid_area_price_area
INSERT INTO metering_grid_area_price_area (
    metering_grid_area_id,
    price_area,
    valid_time_range,
    recorded_by
)
SELECT
    id AS metering_grid_area_id,
    price_area,
    valid_time_range,
    recorded_by
FROM flex.metering_grid_area;
