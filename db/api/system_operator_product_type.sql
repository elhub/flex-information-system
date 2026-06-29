--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-system-operator-product-type-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.system_operator_product_type
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        system_operator_id,
        product_type_id,
        status
    FROM flex.system_operator_product_type
);
-- changeset flex:api-system-operator-product-type-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.system_operator_product_type_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS system_operator_product_type_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        system_operator_id,
        product_type_id,
        status
    FROM flex.system_operator_product_type
    UNION ALL
    SELECT
        history_id AS id,
        id AS system_operator_product_type_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        system_operator_id,
        product_type_id,
        status
    FROM flex.system_operator_product_type_history
);
