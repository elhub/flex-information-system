-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW accounting_point
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        metering_grid_area_id,
        system_operator_id
    FROM flex.accounting_point
);
