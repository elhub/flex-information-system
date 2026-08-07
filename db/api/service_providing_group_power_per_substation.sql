--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-power-per-substation-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_power_per_substation
WITH (security_invoker = true) AS (
    -- RLS: SPGPPS-FISO001
    SELECT
        spgpps.id,
        spgpps.service_providing_group_id,
        spgpps.substations
    FROM flex.service_providing_group_power_per_substation AS spgpps
    WHERE current_role = 'flex_flexibility_information_system_operator'
    UNION ALL
    -- RLS: SPGPPS-SO001
    SELECT
        spgpps.id,
        spgpps.service_providing_group_id,
        spgpps.substations
    FROM flex.service_providing_group_power_per_substation AS spgpps
    WHERE
        current_role = 'flex_system_operator'
        AND EXISTS (
            SELECT 1
            FROM flex.service_providing_group AS spg
            WHERE spg.id = spgpps.service_providing_group_id
        )
);
