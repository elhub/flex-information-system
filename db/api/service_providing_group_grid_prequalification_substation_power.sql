--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-service-providing-group-grid-prequalification-substation-power-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
api.service_providing_group_grid_prequalification_substation_power
WITH (security_invoker = true) AS (
    -- RLS: SPGGPPPS-FISO001
    SELECT
        approved_power.service_providing_group_grid_prequalification_id,
        approved_power.substation_business_id,
        approved_power.substation_name,
        approved_power.controllable_unit_count,
        approved_power.maximum_active_power,
        approved_power.total_approved_maximum_active_power
    FROM flex.service_providing_group_grid_prequalification_substation_power
            AS approved_power
    WHERE current_role = 'flex_flexibility_information_system_operator'
    UNION ALL
    -- RLS: SPGGPPPS-SO001
    -- (SPGGP-SO002/SO003 also expose the grid prequalifications of other SOs
    -- in the same SPG, hence the explicit filter)
    SELECT
        approved_power.service_providing_group_grid_prequalification_id,
        approved_power.substation_business_id,
        approved_power.substation_name,
        approved_power.controllable_unit_count,
        approved_power.maximum_active_power,
        approved_power.total_approved_maximum_active_power
    FROM flex.service_providing_group_grid_prequalification_substation_power
            AS approved_power
    WHERE
        current_role = 'flex_system_operator'
        AND (
            approved_power.impacted_system_operator_id = (SELECT flex.current_party())
            -- RLS: SPGGPPPS-SO002 (PSO of the SPG)
            OR EXISTS (
                SELECT 1
                FROM flex.service_providing_group_grid_prequalification AS gp
                WHERE
                    gp.id
                    = approved_power.service_providing_group_grid_prequalification_id
                    AND flex.current_party_is_pso_in_spg(gp.service_providing_group_id)
            )
        )
);
