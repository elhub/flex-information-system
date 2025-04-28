-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW accounting_point
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.accounting_point
);
