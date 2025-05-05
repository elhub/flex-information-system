--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-end-user-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_end_user
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        end_user_id,
        valid_time_range,
        record_time_range,
        recorded_by
    FROM flex.accounting_point_end_user
);

-- this view is internal, just for the event worker
-- changeset flex:api-accounting-point-end-user-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE api.accounting_point_end_user
TO flex_internal_event_notification;

-- needed for the RLS checks on other resources joining this table to work
-- (but we do not define policies, so selects will yield 0 rows anyway)
GRANT SELECT ON TABLE api.accounting_point_end_user
TO flex_common;
