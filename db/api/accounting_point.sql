--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point
WITH (security_invoker = true) AS (
    SELECT
        ap.id,
        ap.business_id,
        ap_so.system_operator_id,
        ap.recorded_by,
        lower(ap.record_time_range) AS recorded_at
    FROM flex.accounting_point AS ap
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON ap.id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
);
