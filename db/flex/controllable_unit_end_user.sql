--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-end-user-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_end_user AS (
    SELECT
        cu.id AS controllable_unit_id,
        apeu.end_user_id,
        apeu.valid_time_range
    FROM flex.controllable_unit AS cu
        LEFT JOIN flex.accounting_point_end_user AS apeu
            ON cu.accounting_point_id = apeu.accounting_point_id
);

-- changeset flex:controllable-unit-end-user-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_end_user
TO flex_common;

GRANT SELECT ON TABLE controllable_unit_end_user
TO flex_internal_event_notification;
