--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-service-provider-product-suspension-comment-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_provider_product_suspension_comment
WITH (security_invoker = true) AS (
    SELECT
        id,
        content,
        created_at,
        created_by,
        service_provider_product_suspension_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_provider_product_suspension_comment
);
-- changeset flex:api-service-provider-product-suspension-comment-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_provider_product_suspension_comment_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_provider_product_suspension_comment_id,
        content,
        created_at,
        created_by,
        service_provider_product_suspension_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_provider_product_suspension_comment
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_provider_product_suspension_comment_id,
        content,
        created_at,
        created_by,
        service_provider_product_suspension_id,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_provider_product_suspension_comment_history
);
