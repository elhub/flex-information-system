--liquibase formatted sql
-- changeset flex:controllable-unit-suspension-involved-parties endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW flex.controllable_unit_suspension_involved_parties
WITH (security_invoker = false)
AS (
    -- Current suspensions
    SELECT
        cus.id AS controllable_unit_suspension_id,
        unnest(ARRAY[
            cus.impacted_system_operator_id,
            cusp.service_provider_id
        ]) AS party_id
    FROM flex.controllable_unit_suspension AS cus
        LEFT JOIN flex.controllable_unit_service_provider AS cusp
            ON cus.controllable_unit_id = cusp.controllable_unit_id
                AND upper(cusp.valid_time_range) IS null  -- optional: only current provider

    UNION

    -- Historical suspensions
    SELECT
        cush.id AS controllable_unit_suspension_id,
        unnest(ARRAY[
            cush.impacted_system_operator_id,
            cusp.service_provider_id
        ]) AS party_id
    FROM flex.controllable_unit_suspension_history AS cush
        LEFT JOIN flex.controllable_unit_service_provider AS cusp
            ON cush.controllable_unit_id = cusp.controllable_unit_id
);
