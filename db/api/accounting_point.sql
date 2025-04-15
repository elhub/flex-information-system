-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW accounting_point
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        metering_grid_area_id,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.accounting_point
);

CREATE OR REPLACE VIEW accounting_point_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS accounting_point_id,
        business_id,
        metering_grid_area_id,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.accounting_point
    UNION ALL
    SELECT
        history_id AS id,
        id AS accounting_point_id,
        business_id,
        metering_grid_area_id,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.accounting_point_history
);
