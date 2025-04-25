-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW metering_grid_area
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        name,
        price_area,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.metering_grid_area
);
