--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-summary-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.service_providing_group_summary
WITH (security_invoker = true) AS (
    -- RLS: SPGSU-COM001
    SELECT
        spgsu.id,
        spgsu.service_providing_group_id,
        spgsu.controllable_unit,
        spgsu.technical_resource
    FROM flex.service_providing_group_summary AS spgsu
    WHERE
        EXISTS (
            SELECT 1
            FROM flex.service_providing_group AS spg
            WHERE spg.id = spgsu.service_providing_group_id
        )
);
