-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW service_provider_product_application_comment
WITH (security_invoker = true) AS (
    SELECT
        id,
        content,
        created_at,
        created_by,
        service_provider_product_application_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_provider_product_application_comment
);

CREATE OR REPLACE VIEW service_provider_product_application_comment_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_provider_product_application_comment_id,
        content,
        created_at,
        created_by,
        service_provider_product_application_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_provider_product_application_comment
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_provider_product_application_comment_id,
        content,
        created_at,
        created_by,
        service_provider_product_application_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_provider_product_application_comment_history
);
