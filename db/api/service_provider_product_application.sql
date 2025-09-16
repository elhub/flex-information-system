--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-service-provider-product-application-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.service_provider_product_application
WITH (security_invoker = true) AS (
    SELECT
        id,
        notes,
        product_type_ids,
        qualified_at,
        service_provider_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_provider_product_application
);
-- changeset flex:api-service-provider-product-application-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.service_provider_product_application_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_provider_product_application_id,
        notes,
        product_type_ids,
        qualified_at,
        service_provider_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_provider_product_application
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_provider_product_application_id,
        notes,
        product_type_ids,
        qualified_at,
        service_provider_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_provider_product_application_history
);
