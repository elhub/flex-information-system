CREATE OR REPLACE VIEW controllable_unit_end_user AS (
    SELECT
        cu.id AS controllable_unit_id,
        apeu.end_user_id,
        apeu.valid_time_range
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point AS ap
            ON cu.accounting_point_id = ap.business_id
        LEFT JOIN flex.accounting_point_end_user AS apeu
            ON ap.id = apeu.accounting_point_id
);

GRANT SELECT ON TABLE controllable_unit_end_user
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_end_user
TO flex_internal_event_notification;
