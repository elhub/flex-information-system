--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-service-providing-group-grid-suspension-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_suspension
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        impacted_system_operator_id,
        service_providing_group_id,
        reason
    FROM flex.service_providing_group_grid_suspension
);
-- changeset flex:api-service-providing-group-grid-suspension-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_suspension_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS service_providing_group_grid_suspension_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        impacted_system_operator_id,
        service_providing_group_id,
        reason
    FROM flex.service_providing_group_grid_suspension
    UNION ALL
    SELECT
        history_id AS id,
        id AS service_providing_group_grid_suspension_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        impacted_system_operator_id,
        service_providing_group_id,
        reason
    FROM flex.service_providing_group_grid_suspension_history
);
