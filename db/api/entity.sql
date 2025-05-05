--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-entity-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.entity
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        name,
        type
    FROM flex.entity
);
