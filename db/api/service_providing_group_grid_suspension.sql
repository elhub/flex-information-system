--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-service-providing-group-grid-suspension-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_suspension
WITH (security_invoker = true) AS (
    SELECT
        id,
        impacted_system_operator_id,
        reason,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_providing_group_grid_suspension
);
-- changeset flex:api-service-providing-group-grid-suspension-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_suspension_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_grid_suspension_id,
        impacted_system_operator_id,
        reason,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_providing_group_grid_suspension
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_grid_suspension_id,
        impacted_system_operator_id,
        reason,
        service_providing_group_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_providing_group_grid_suspension_history
);
