--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-party-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.party
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        type,
        status
    FROM flex.party
);
-- changeset flex:api-party-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.party_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        type,
        status
    FROM flex.party
    UNION ALL
    SELECT
        history_id AS id,
        id AS party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        business_id,
        business_id_type,
        entity_id,
        name,
        role,
        type,
        status
    FROM flex.party_history
);
