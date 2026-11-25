--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:service-providing-group-grid-prequalification-substation-power-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW service_providing_group_grid_prequalification_substation_power
-- security_invoker: RLS applies, so an SO only sees its own grid
-- prequalifications and the CUs it is CSO of
WITH (security_invoker = true) AS (
    WITH member AS (
        -- current CUs of each SPGGP's SPG, located at a substation, with the
        -- impacted SO as CSO (a PSO of the SPG sees all CUs of the group)
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
            LEFT JOIN flex.accounting_point_system_operator AS ap_so
                ON cu.accounting_point_id = ap_so.accounting_point_id
                    AND ap_so.system_operator_id = gp.impacted_system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON cu.accounting_point_id = apgl.accounting_point_id
        WHERE ap_so.accounting_point_id IS NOT NULL
            OR flex.current_party_is_pso_in_spg(gp.service_providing_group_id)
    ),

    -- the snapshot depends on the SPG, the SO and the approval time only, so
    -- it is read once for each of those and not once for each CU
    approved_gp AS MATERIALIZED (
        SELECT DISTINCT
            gp.service_providing_group_id AS spg_id,
            gp.impacted_system_operator_id AS so_id,
            gp.prequalified_at
        FROM flex.service_providing_group_grid_prequalification AS gp
        WHERE gp.status IN ('approved', 'conditionally_approved')
            AND gp.prequalified_at IS NOT NULL
    ),

    -- OFFSET 0 keeps the planner from merging this CTE into the joins below,
    -- which would call the function once per row instead of once per SPGGP
    snap AS MATERIALIZED (
        SELECT DISTINCT
            a.so_id,
            cu.id AS cu_id,
            cu.accounting_point_id,
            cu.maximum_active_power AS power
        FROM approved_gp AS a
            CROSS JOIN LATERAL flex.spg_cu_snapshot(
                a.spg_id, a.so_id, a.prequalified_at
            ) AS s
            INNER JOIN flex.controllable_unit AS cu ON s.controllable_unit_id = cu.id
        -- only CUs that are still members of the SPG
        WHERE EXISTS (
            SELECT 1
            FROM flex.service_providing_group_membership AS m
            WHERE m.service_providing_group_id = a.spg_id
                AND m.controllable_unit_id = s.controllable_unit_id
                AND m.valid_time_range @> current_timestamp
        )
        OFFSET 0
    ),

    total_approved AS (
        -- per SO and substation, over all approved SPGGPs. A CU in several
        -- approved SPGs is counted once. Only CUs that were members of the SPG
        -- (known and valid) at prequalified_at count, so CUs added after the
        -- approval are left out until the changes are approved
        -- (prequalified_at moves). Only CUs the SO is CSO of are counted.
        SELECT
            x.so_id,
            x.name,
            SUM(x.power) AS power
        FROM (
            SELECT DISTINCT
                c.so_id,
                apgl.name,
                c.cu_id,
                c.power
            FROM snap AS c
                INNER JOIN flex.accounting_point_grid_location AS apgl
                    ON c.accounting_point_id = apgl.accounting_point_id
            WHERE EXISTS (
                SELECT 1
                FROM flex.accounting_point_system_operator AS ap_so
                WHERE ap_so.accounting_point_id = c.accounting_point_id
                    AND ap_so.system_operator_id = c.so_id
                    AND ap_so.valid_time_range @> current_timestamp
            )
        ) AS x
        GROUP BY x.so_id, x.name
    )

    SELECT
        own.gp_id AS service_providing_group_grid_prequalification_id,
        own.so_id AS impacted_system_operator_id,
        own.name AS substation_name,
        COUNT(*) AS controllable_unit_count,
        SUM(own.power) AS maximum_active_power,
        COALESCE(MAX(total.power), 0) AS total_approved_maximum_active_power
    FROM member AS own
        LEFT JOIN total_approved AS total
            ON own.so_id = total.so_id AND own.name = total.name
    GROUP BY own.gp_id, own.so_id, own.name
);

-- changeset flex:service-providing-group-grid-prequalification-substation-power-grants-v2 runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_grid_prequalification_substation_power TO flex_common;
