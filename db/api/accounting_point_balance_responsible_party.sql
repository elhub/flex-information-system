-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW accounting_point_balance_responsible_party
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        balance_responsible_party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_balance_responsible_party
);

CREATE OR REPLACE VIEW accounting_point_balance_responsible_party_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS accounting_point_balance_responsible_party_id,
        accounting_point_id,
        balance_responsible_party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_balance_responsible_party
    UNION ALL
    SELECT
        history_id AS id,
        id AS accounting_point_balance_responsible_party_id,
        accounting_point_id,
        balance_responsible_party_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_balance_responsible_party_history
);
