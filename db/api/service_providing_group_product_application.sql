-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW service_providing_group_product_application
WITH (security_invoker = true) AS (
    SELECT
        id,
        last_prequalified,
        last_verified,
        notes,
        procuring_system_operator_id,
        product_type_id,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_providing_group_product_application
);

CREATE OR REPLACE VIEW service_providing_group_product_application_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_product_application_id,
        last_prequalified,
        last_verified,
        notes,
        procuring_system_operator_id,
        product_type_id,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_providing_group_product_application
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_product_application_id,
        last_prequalified,
        last_verified,
        notes,
        procuring_system_operator_id,
        product_type_id,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_providing_group_product_application_history
);
