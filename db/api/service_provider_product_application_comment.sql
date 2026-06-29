--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-service-provider-product-application-comment-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_provider_product_application_comment
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        service_provider_product_application_id,
        created_by,
        created_at,
        visibility,
        content
    FROM flex.service_provider_product_application_comment
);
-- changeset flex:api-service-provider-product-application-comment-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_provider_product_application_comment_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_provider_product_application_comment_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        service_provider_product_application_id,
        created_by,
        created_at,
        visibility,
        content
    FROM flex.service_provider_product_application_comment
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_provider_product_application_comment_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        service_provider_product_application_id,
        created_by,
        created_at,
        visibility,
        content
    FROM flex.service_provider_product_application_comment_history
);
