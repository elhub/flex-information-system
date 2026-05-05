--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-bidding-zone-create runAlways:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_bidding_zone
WITH (security_invoker = false) AS (
    SELECT
        ap_mga.accounting_point_id,
        mga_pa.price_area AS bidding_zone,
        (
            ap_mga.valid_time_range
            * mga_pa.valid_time_range
        ) AS valid_time_range
    FROM flex.accounting_point_metering_grid_area AS ap_mga
        INNER JOIN flex.metering_grid_area_price_area AS mga_pa
            ON ap_mga.metering_grid_area_id = mga_pa.metering_grid_area_id
                AND ap_mga.valid_time_range && mga_pa.valid_time_range
);

-- changeset flex:accounting-point-bidding-zone-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_bidding_zone
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_bidding_zone
TO flex_common;
