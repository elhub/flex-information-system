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

    -- CUs of the approved SPGGPs as they were when approved, and still members.
    -- The snapshot function is called once for each (SPG, SO, approval time).
    snap AS (
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
            ) AS s
            INNER JOIN flex.controllable_unit AS cu
                ON s.controllable_unit_id = cu.id
            INNER JOIN flex.service_providing_group_membership AS m
                ON m.service_providing_group_id = a.spg_id
                    AND m.controllable_unit_id = cu.id
                    AND m.valid_time_range @> current_timestamp
    ),

    -- per SO and substation. A CU in several approved SPGs is counted once.
    -- Only CUs the SO is CSO of are counted.
    total_approved AS (
        SELECT
            snap.so_id,
            apgl.name,
            SUM(snap.power) AS power
        FROM snap
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON snap.accounting_point_id = ap_so.accounting_point_id
                    AND snap.so_id = ap_so.system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON snap.accounting_point_id = apgl.accounting_point_id
        GROUP BY snap.so_id, apgl.name
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
