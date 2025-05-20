--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-service-provider-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW accounting_point_service_provider
WITH (security_invoker = false) AS (
    SELECT
        cu.accounting_point_id,
        cusp.service_provider_id,
        cusp.valid_time_range
    FROM flex.controllable_unit_service_provider AS cusp -- noqa
        INNER JOIN flex.controllable_unit AS cu
            ON cusp.controllable_unit_id = cu.id
    WHERE cusp.valid_time_range IS NOT null
);

-- changeset flex:accounting-point-service-provider-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE accounting_point_service_provider
TO flex_common;

GRANT SELECT ON TABLE accounting_point_service_provider
TO flex_internal_event_notification;
