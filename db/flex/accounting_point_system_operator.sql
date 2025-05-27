--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-system-operator-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_system_operator
WITH (security_invoker = false) AS (
    SELECT
        ap_mga.accounting_point_id,
        mga.system_operator_id,
        row_number() OVER () AS id,
        (ap_mga.valid_time_range * mga.valid_time_range) AS valid_time_range
    FROM accounting_point_metering_grid_area AS ap_mga
        INNER JOIN metering_grid_area AS mga
            ON ap_mga.metering_grid_area_id = mga.id
                AND ap_mga.valid_time_range && mga.valid_time_range
);

-- changeset flex:accounting-point-system-operator-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_system_operator
TO flex_common;

GRANT SELECT ON TABLE accounting_point_system_operator
TO flex_internal_event_notification;
