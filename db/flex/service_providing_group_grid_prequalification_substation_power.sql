--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:service-providing-group-grid-prequalification-substation-power-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW service_providing_group_grid_prequalification_substation_power
-- security_invoker: RLS applies to the tables read below, so an SO only sees
-- its own grid prequalifications.
--
-- One row per grid prequalification (SPGGP) and substation, with
--   * the CUs and power the SPGGP has now ("own"), and
--   * the power of all CUs that have been approved for the same SO in the
--     same substation ("total approved").
WITH (security_invoker = true) AS (
    WITH current_power_by_station AS (
        -- The current CUs of the SPG of each SPGGP, per substation.
        -- The impacted SO only sees the CUs it is CSO of. A PSO of the SPG sees
        -- all CUs of the group.
        SELECT
            gp.id AS gp_id,
            gp.impacted_system_operator_id AS so_id,
            apgl.name AS substation_name,
            COUNT(*) AS controllable_unit_count,
            SUM(cu.maximum_active_power) AS maximum_active_power
        FROM flex.service_providing_group_grid_prequalification AS gp
            INNER JOIN flex.service_providing_group_membership AS spgm
                ON gp.service_providing_group_id = spgm.service_providing_group_id
                    AND spgm.valid_time_range @> current_timestamp
            INNER JOIN flex.controllable_unit AS cu
                ON spgm.controllable_unit_id = cu.id
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON cu.accounting_point_id = apgl.accounting_point_id
        WHERE EXISTS (
                SELECT 1
                FROM flex.accounting_point_system_operator AS ap_so
                WHERE ap_so.accounting_point_id = cu.accounting_point_id
                    AND ap_so.system_operator_id = gp.impacted_system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            )
            OR flex.current_party_is_pso_in_spg(gp.service_providing_group_id)
        GROUP BY gp.id, gp.impacted_system_operator_id, apgl.name
    ),

    -- Compute the historical snapshot per approval before joining current memberships.
    -- Using existing spg_cu_snapshot function to find which CUs has changed since prequalified_at
    approval_snapshot AS MATERIALIZED (
        SELECT
            gp.service_providing_group_id AS spg_id,
            gp.impacted_system_operator_id AS so_id,
            snapshot.controllable_unit_id AS cu_id
        FROM flex.service_providing_group_grid_prequalification AS gp
            CROSS JOIN LATERAL flex.spg_cu_snapshot(
                gp.service_providing_group_id,
                gp.impacted_system_operator_id,
                gp.prequalified_at
            ) AS snapshot
        WHERE gp.status IN ('approved', 'conditionally_approved')
    ),

    -- Check membership in the same SPG before counting a CU only once per SO.
    approved_cu AS (
        SELECT DISTINCT s.so_id, s.cu_id
        FROM approval_snapshot AS s
            INNER JOIN flex.service_providing_group_membership AS m
                ON m.service_providing_group_id = s.spg_id
                    AND m.controllable_unit_id = s.cu_id
                    AND m.valid_time_range @> current_timestamp
    ),

    -- The total per SO and substation. The DISTINCT above means a CU in several
    -- approved SPGs is counted once. Only the CUs the SO is CSO of are counted,
    -- so no SO can see the power of another SO's CUs.
    total_approved AS (
        SELECT
            approved_cu.so_id,
            apgl.name AS substation_name,
            SUM(cu.maximum_active_power) AS power
        FROM approved_cu
            INNER JOIN flex.controllable_unit AS cu ON cu.id = approved_cu.cu_id
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON cu.accounting_point_id = ap_so.accounting_point_id
                    AND approved_cu.so_id = ap_so.system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON cu.accounting_point_id = apgl.accounting_point_id
        GROUP BY approved_cu.so_id, apgl.name
    )

    SELECT
        own.gp_id AS service_providing_group_grid_prequalification_id,
        own.so_id AS impacted_system_operator_id,
        own.substation_name,
        own.controllable_unit_count,
        own.maximum_active_power,
        COALESCE(total_approved.power, 0) AS total_approved_maximum_active_power
    FROM current_power_by_station AS own
        LEFT JOIN total_approved USING (so_id, substation_name)
);

-- changeset flex:service-providing-group-grid-prequalification-substation-power-grants-v2 runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_grid_prequalification_substation_power TO flex_common;
