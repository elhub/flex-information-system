-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE OR REPLACE VIEW service_providing_group_membership
WITH (security_invoker = true) AS (
    SELECT
        id,
        controllable_unit_id,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.service_providing_group_membership
);

CREATE OR REPLACE VIEW service_providing_group_membership_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_membership_id,
        controllable_unit_id,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.service_providing_group_membership
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_membership_id,
        controllable_unit_id,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.service_providing_group_membership_history
);
