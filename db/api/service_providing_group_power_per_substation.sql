--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-power-per-substation-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_power_per_substation
WITH (security_invoker = true) AS (
    -- RLS: SPGPPS-COM001
    SELECT
        spgpps.id,
        spgpps.service_providing_group_id,
        spgpps.substations
    FROM flex.service_providing_group_power_per_substation AS spgpps
    WHERE
        EXISTS (
            SELECT 1
            FROM flex.service_providing_group AS spg
            WHERE spg.id = spgpps.service_providing_group_id
        )
);
