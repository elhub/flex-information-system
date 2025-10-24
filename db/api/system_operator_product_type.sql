--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-system-operator-product-type-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.system_operator_product_type
WITH (security_invoker = true) AS (
    SELECT
        id,
        product_type_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.system_operator_product_type
);
-- changeset flex:api-system-operator-product-type-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.system_operator_product_type_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS system_operator_product_type_id,
        product_type_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.system_operator_product_type
    UNION ALL
    SELECT
        history_id AS id,
        id AS system_operator_product_type_id,
        product_type_id,
        status,
        system_operator_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.system_operator_product_type_history
);
