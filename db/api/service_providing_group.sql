-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW service_providing_group
WITH (security_invoker = true) AS (
    SELECT
        id,
        name,
        service_provider_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_providing_group
);

CREATE OR REPLACE VIEW service_providing_group_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_id,
        name,
        service_provider_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_providing_group
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_id,
        name,
        service_provider_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_providing_group_history
);
