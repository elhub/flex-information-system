--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-bidding-zone-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_bidding_zone
WITH (security_invoker = false, security_barrier = true) AS (
    -- RLS: APBZ-FISO001
    SELECT
        accounting_point_id,
        bidding_zone,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_bidding_zone
    WHERE current_role = 'flex_flexibility_information_system_operator'
);
