--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:api-accounting-point-end-user-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_end_user
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        end_user_id,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_end_user
);
