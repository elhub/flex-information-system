--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-controllable-unit-suspension-comment-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension_comment
WITH (security_invoker = true) AS (
    SELECT
        id,
        content,
        controllable_unit_suspension_id,
        created_at,
        created_by,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.controllable_unit_suspension_comment
);
-- changeset flex:api-controllable-unit-suspension-comment-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.controllable_unit_suspension_comment_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS controllable_unit_suspension_comment_id,
        content,
        controllable_unit_suspension_id,
        created_at,
        created_by,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at
    FROM flex.controllable_unit_suspension_comment
    UNION ALL
    SELECT
        history_id AS id,
        id AS controllable_unit_suspension_comment_id,
        content,
        controllable_unit_suspension_id,
        created_at,
        created_by,
        visibility,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at
    FROM flex.controllable_unit_suspension_comment_history
);
