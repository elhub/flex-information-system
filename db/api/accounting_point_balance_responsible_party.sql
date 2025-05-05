--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-balance-responsible-party-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_balance_responsible_party
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

-- changeset flex:api-accounting-point-balance-responsible-party-grant endDelimiter:; runAlways:true
GRANT SELECT ON TABLE api.accounting_point_balance_responsible_party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE api.accounting_point_balance_responsible_party
TO flex_common;
