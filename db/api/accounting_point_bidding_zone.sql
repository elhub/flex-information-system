--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-accounting-point-bidding-zone-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_bidding_zone
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        bidding_zone,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_bidding_zone
);
