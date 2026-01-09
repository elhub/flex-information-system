--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-end-user-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.accounting_point_end_user
WITH (security_invoker = false, security_barrier = true) AS (
    -- RLS: APEU-FISO001
    SELECT
        accounting_point_id,
        end_user_id,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_end_user
    WHERE current_role = 'flex_flexibility_information_system_operator'
);
