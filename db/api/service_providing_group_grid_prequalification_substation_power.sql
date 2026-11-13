--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-grid-prequalification-substation-power-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_prequalification_substation_power
WITH (security_invoker = true) AS (
    -- RLS: SPGGPPPS-FISO001
    SELECT
        sp.service_providing_group_grid_prequalification_id,
        sp.substation_business_id,
        sp.substation_name,
        sp.controllable_unit_count,
        sp.maximum_active_power,
        sp.total_approved_maximum_active_power
    FROM flex.service_providing_group_grid_prequalification_substation_power AS sp
    WHERE current_role = 'flex_flexibility_information_system_operator'
    UNION ALL
    -- RLS: SPGGPPPS-SO001
    -- (SPGGP-SO002/SO003 also expose the grid prequalifications of other SOs
    -- in the same SPG, hence the explicit filter)
    SELECT
        sp.service_providing_group_grid_prequalification_id,
        sp.substation_business_id,
        sp.substation_name,
        sp.controllable_unit_count,
        sp.maximum_active_power,
        sp.total_approved_maximum_active_power
    FROM flex.service_providing_group_grid_prequalification_substation_power AS sp
    WHERE
        current_role = 'flex_system_operator'
        AND sp.impacted_system_operator_id = (SELECT flex.current_party())
);
