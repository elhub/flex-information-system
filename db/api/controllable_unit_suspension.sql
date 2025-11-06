--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-controllable-unit-suspension-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension
WITH (security_invoker = true) AS (
    SELECT
        id,
        controllable_unit_id,
        impacted_system_operator_id,
        reason,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.controllable_unit_suspension
);
-- changeset flex:api-controllable-unit-suspension-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_suspension_id,
        controllable_unit_id,
        impacted_system_operator_id,
        reason,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.controllable_unit_suspension
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_suspension_id,
        controllable_unit_id,
        impacted_system_operator_id,
        reason,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.controllable_unit_suspension_history
);
