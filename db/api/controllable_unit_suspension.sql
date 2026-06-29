--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:api-controllable-unit-suspension-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        controllable_unit_id,
        impacted_system_operator_id,
        reason
    FROM flex.controllable_unit_suspension
);
-- changeset flex:api-controllable-unit-suspension-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_suspension_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,
        controllable_unit_id,
        impacted_system_operator_id,
        reason
    FROM flex.controllable_unit_suspension
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_suspension_id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,
        controllable_unit_id,
        impacted_system_operator_id,
        reason
    FROM flex.controllable_unit_suspension_history
);
