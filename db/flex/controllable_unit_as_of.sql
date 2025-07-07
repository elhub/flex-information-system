--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-as-of-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_as_of
WITH (security_invoker = false)
AS (
    SELECT
        cusp.controllable_unit_id,
        cusp.service_provider_id AS party_id,
        'flex_service_provider' AS party_role,
        least(
            max(coalesce(upper(cusp.valid_time_range), 'infinity')),
            current_timestamp
        ) AS as_of
    FROM flex.controllable_unit_service_provider AS cusp
    GROUP BY cusp.controllable_unit_id, cusp.service_provider_id
);

-- changeset flex:controllable-unit-as-of-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_as_of
TO flex_common;
