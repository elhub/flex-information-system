-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW controllable_unit_service_provider
WITH (security_invoker = true) AS (
    SELECT
        id,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider
);

CREATE OR REPLACE VIEW controllable_unit_service_provider_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_service_provider_id,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_service_provider_id,
        controllable_unit_id,
        service_provider_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.controllable_unit_service_provider_history
);
