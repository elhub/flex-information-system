--liquibase formatted sql
-- Manually managed file

-- changeset flex:metering-grid-area-bidding-zone-init runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM metering_grid_area_bidding_zone
INSERT INTO metering_grid_area_bidding_zone (
    metering_grid_area_id,
    bidding_zone,
    valid_time_range,
    recorded_by
)
SELECT
    id AS metering_grid_area_id,
    price_area AS bidding_zone,
    valid_time_range,
    recorded_by
FROM flex.metering_grid_area;
