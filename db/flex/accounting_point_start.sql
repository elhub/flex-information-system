--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-start-date-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_start
WITH (security_invoker = false) AS (
    SELECT
        ap.id AS accounting_point_id,
        MIN(cu.start_date)::timestamp AT TIME ZONE 'Europe/Oslo'
            AS controllable_unit_start_time,
        MIN(LOWER(cusp.valid_time_range))
            AS controllable_unit_service_provider_valid_time_start
    FROM flex.accounting_point AS ap
        LEFT JOIN flex.controllable_unit AS cu
            ON ap.id = cu.accounting_point_id
        LEFT JOIN flex.controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
    GROUP BY ap.id
);

-- changeset flex:accounting-point-start-date-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_start
TO flex_internal_data;
