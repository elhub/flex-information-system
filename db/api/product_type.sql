--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-product-type-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.product_type
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        category,
        examples,
        market,
        market_type,
        notes
    FROM flex.product_type
);
