-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW product_type
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
