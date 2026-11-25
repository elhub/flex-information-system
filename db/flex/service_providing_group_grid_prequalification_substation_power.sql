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
-- Substations are identified by name, as the same substation can have
-- different business IDs.
WITH (security_invoker = true) AS (
    WITH own AS (
        -- The current CUs of the SPG of each SPGGP, per substation.
        -- The impacted SO only sees the CUs it is CSO of. A PSO of the SPG sees
        -- all CUs of the group.
        SELECT
            gp.id AS gp_id,
            gp.impacted_system_operator_id AS so_id,
            cu.maximum_active_power AS power,
            apgl.name
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
    ),

    -- The CUs each approved SPGGP had when it was approved, and still has.
    -- A CU added later is not counted until the changes are approved
    -- (prequalified_at moves).
    -- The snapshot is expensive (about 30 ms), so it is called once for each
    -- (SPG, SO, approval time) in the subquery. Do not call it from "own":
    -- that has one row per CU, which made the view take over a minute.
    approved_cu AS (
        SELECT DISTINCT
            a.so_id,
            cu.id AS cu_id,
            cu.accounting_point_id,
            cu.maximum_active_power AS power
        FROM (
            SELECT DISTINCT
                service_providing_group_id AS spg_id,
                impacted_system_operator_id AS so_id,
                prequalified_at
            FROM flex.service_providing_group_grid_prequalification
            WHERE status IN ('approved', 'conditionally_approved')
        ) AS a
            CROSS JOIN LATERAL flex.spg_cu_snapshot(
                a.spg_id, a.so_id, a.prequalified_at
            ) AS snapshot
            INNER JOIN flex.controllable_unit AS cu
                ON snapshot.controllable_unit_id = cu.id
            INNER JOIN flex.service_providing_group_membership AS spgm
                ON spgm.service_providing_group_id = a.spg_id
                    AND spgm.controllable_unit_id = cu.id
                    AND spgm.valid_time_range @> current_timestamp
    ),

    -- The total per SO and substation. The DISTINCT above means a CU in several
    -- approved SPGs is counted once. Only the CUs the SO is CSO of are counted,
    -- so no SO can see the power of another SO's CUs.
    total_approved AS (
        SELECT
            approved_cu.so_id,
            apgl.name,
            SUM(approved_cu.power) AS power
        FROM approved_cu
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON approved_cu.accounting_point_id = ap_so.accounting_point_id
                    AND approved_cu.so_id = ap_so.system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON approved_cu.accounting_point_id = apgl.accounting_point_id
        GROUP BY approved_cu.so_id, apgl.name
    )

    SELECT
        own.gp_id AS service_providing_group_grid_prequalification_id,
        own.so_id AS impacted_system_operator_id,
        own.name AS substation_name,
        COUNT(*) AS controllable_unit_count,
        SUM(own.power) AS maximum_active_power,
        COALESCE(MAX(total_approved.power), 0) AS total_approved_maximum_active_power
    FROM own
        LEFT JOIN total_approved
            ON own.so_id = total_approved.so_id AND own.name = total_approved.name
    GROUP BY own.gp_id, own.so_id, own.name
);

-- changeset flex:service-providing-group-grid-prequalification-substation-power-grants-v2 runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_grid_prequalification_substation_power TO flex_common;
