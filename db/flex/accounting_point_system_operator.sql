--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-system-operator-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_system_operator
WITH (security_invoker = false) AS (
    SELECT
        ap_mga.accounting_point_id,
        mga_so.system_operator_id,
        row_number() OVER () AS id,
        (
            ap_mga.valid_time_range
            * mga_so.valid_time_range
        ) AS valid_time_range
    FROM flex.accounting_point_metering_grid_area AS ap_mga
        INNER JOIN flex.metering_grid_area_system_operator AS mga_so
            ON ap_mga.metering_grid_area_id = mga_so.metering_grid_area_id
                AND ap_mga.valid_time_range && mga_so.valid_time_range
);

-- changeset flex:accounting-point-system-operator-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_system_operator
TO flex_common;

GRANT SELECT ON TABLE accounting_point_system_operator
TO flex_internal_event_notification;
