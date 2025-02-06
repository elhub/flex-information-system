-- Manually managed file
-- View for the backend to continue querying the api schema when possible

CREATE OR REPLACE VIEW accounting_point_end_user
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
GRANT SELECT ON TABLE accounting_point_end_user
TO flex_internal_event_notification;
