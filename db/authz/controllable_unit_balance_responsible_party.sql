CREATE OR REPLACE VIEW controllable_unit_balance_responsible_party AS (
    SELECT
        cu.id AS controllable_unit_id,
        apbrp.balance_responsible_party_id,
        apbrp.valid_time_range
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point AS ap
            ON cu.accounting_point_id = ap.business_id
        LEFT JOIN flex.accounting_point_balance_responsible_party AS apbrp
            ON ap.id = apbrp.accounting_point_id
);

GRANT SELECT ON TABLE controllable_unit_balance_responsible_party
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_balance_responsible_party
TO flex_internal_event_notification;
