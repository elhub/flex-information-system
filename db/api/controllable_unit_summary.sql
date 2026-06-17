--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-controllable-unit-summary-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.controllable_unit_summary
WITH (security_invoker = true) AS (
    -- RLS: CUSU-COM001
    SELECT
        cusu.id,
        cusu.controllable_unit_id,
        cusu.technical_resource
    FROM flex.controllable_unit_summary AS cusu
    WHERE
        EXISTS (
            SELECT 1
            FROM flex.controllable_unit AS cu
            WHERE cu.id = cusu.controllable_unit_id
        )
);
