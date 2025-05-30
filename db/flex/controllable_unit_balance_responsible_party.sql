--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-balance-responsible-party-create runAlways:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_balance_responsible_party AS (
    SELECT
        cu.id AS controllable_unit_id,
        apbrp.balance_responsible_party_id,
        apbrp.valid_time_range
    FROM flex.controllable_unit AS cu
        LEFT JOIN flex.accounting_point_balance_responsible_party AS apbrp
            ON cu.accounting_point_id = apbrp.accounting_point_id
);

-- changeset flex:controllable-unit-balance-responsible-party-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_balance_responsible_party
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_balance_responsible_party
TO flex_internal_event_notification;
