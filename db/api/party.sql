--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-party-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.party
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        status,
        type,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.party
);
-- changeset flex:api-party-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.party_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS party_id,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        status,
        type,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.party
    UNION ALL
    SELECT
        history_id AS id,
        id AS party_id,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        status,
        type,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.party_history
);
