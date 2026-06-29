--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-product-type-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.product_type
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        name,
        service,
        products
    FROM flex.product_type
);
