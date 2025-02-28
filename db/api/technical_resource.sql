-- Manually managed file

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

CREATE OR REPLACE VIEW technical_resource
WITH (security_invoker = true) AS (
    SELECT
        tr.id,
        tr.controllable_unit_id,
        tr.details,
        tr.name,
        tr.recorded_by,
        tr.recorded_at
    FROM (
        SELECT
            trh.*,
            row_number()
                OVER (
                    PARTITION BY trh.technical_resource_id
                    ORDER BY trh.recorded_at DESC
                )
            AS rn
        FROM api.technical_resource_history AS trh
    ) AS tr
    WHERE tr.rn = 1
);
