--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-service-providing-group-grid-prequalification-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_prequalification
WITH (security_invoker = true) AS (
    SELECT
        id,
        impacted_system_operator_id,
        prequalified_at,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.service_providing_group_grid_prequalification
);
-- changeset flex:api-service-providing-group-grid-prequalification-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_prequalification_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_grid_prequalification_id,
        impacted_system_operator_id,
        prequalified_at,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.service_providing_group_grid_prequalification
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_grid_prequalification_id,
        impacted_system_operator_id,
        prequalified_at,
        service_providing_group_id,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.service_providing_group_grid_prequalification_history
);
