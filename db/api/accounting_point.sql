--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-accounting-point-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.accounting_point
);
