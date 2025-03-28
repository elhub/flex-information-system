-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW entity
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        name,
        type
    FROM flex.entity
);
