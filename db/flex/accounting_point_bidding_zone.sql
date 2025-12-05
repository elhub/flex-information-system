--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-bidding-zone-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_bidding_zone
WITH (security_invoker = true) AS (
    SELECT
        ap_mga.accounting_point_id,
        mga.price_area AS bidding_zone,
        ap_mga.valid_time_range
    FROM flex.accounting_point_metering_grid_area AS ap_mga
        INNER JOIN flex.metering_grid_area AS mga
            ON ap_mga.metering_grid_area_id = mga.id
);

-- changeset flex:accounting-point-bidding-zone-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_bidding_zone
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_bidding_zone
TO flex_common;
