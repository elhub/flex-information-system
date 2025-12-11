--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-bidding-zone-create runAlways:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_bidding_zone
WITH (security_invoker = false) AS (
    SELECT
        cu.id AS controllable_unit_id,
        apbz.bidding_zone,
        apbz.valid_time_range
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point_bidding_zone AS apbz
            ON cu.accounting_point_id = apbz.accounting_point_id
);

-- changeset flex:controllable-unit-bidding-zone-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_bidding_zone
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_bidding_zone
TO flex_internal_event_notification;
