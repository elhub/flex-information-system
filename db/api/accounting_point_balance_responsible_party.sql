-- Manually managed file
CREATE OR REPLACE VIEW accounting_point_balance_responsible_party
WITH (security_invoker = true) AS (
    SELECT
        id,
        accounting_point_id,
        balance_responsible_party_id,
        valid_time_range,
        record_time_range,
        recorded_by
    FROM flex.accounting_point_balance_responsible_party
);

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_common;
