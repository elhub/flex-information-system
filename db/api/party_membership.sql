-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW party_membership
WITH (security_invoker = true) AS (
    SELECT
        id,
        entity_id,
        party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.party_membership
);

CREATE OR REPLACE VIEW party_membership_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS party_membership_id,
        entity_id,
        party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.party_membership
    UNION ALL
    SELECT
        history_id AS id,
        id AS party_membership_id,
        entity_id,
        party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.party_membership_history
);
