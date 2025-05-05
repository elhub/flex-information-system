--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-service-providing-group-membership-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.service_providing_group_membership
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
-- changeset flex:api-service-providing-group-membership-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.service_providing_group_membership_history
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
