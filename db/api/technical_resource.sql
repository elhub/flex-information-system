-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW technical_resource
WITH (security_invoker = true) AS (
    SELECT
        id,
        controllable_unit_id,
        details,
        name,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.technical_resource
);

CREATE OR REPLACE VIEW technical_resource_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS technical_resource_id,
        controllable_unit_id,
        details,
        name,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.technical_resource
    UNION ALL
    SELECT
        history_id AS id,
        id AS technical_resource_id,
        controllable_unit_id,
        details,
        name,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.technical_resource_history
);
