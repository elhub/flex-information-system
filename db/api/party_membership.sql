--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-party-membership-create endDelimiter:-- runAlways:true
-- runAlways to be able to change flex.scope over time
CREATE OR REPLACE VIEW
api.party_membership
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        party_id,
        entity_id,
        scopes
    FROM flex.party_membership
);
-- changeset flex:api-party-membership-history-create endDelimiter:-- runAlways:true
-- runAlways to be able to change flex.scope over time
CREATE OR REPLACE VIEW
api.party_membership_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS party_membership_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        party_id,
        entity_id,
        scopes
    FROM flex.party_membership
    UNION ALL
    SELECT
        history_id AS id,
        id AS party_membership_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        party_id,
        entity_id,
        scopes
    FROM flex.party_membership_history
);
