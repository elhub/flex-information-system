--liquibase formatted sql
-- Manually managed file
-- noqa: disable=all

-- changeset flex:service-providing-group-grid-prequalification-substation-power-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW service_providing_group_grid_prequalification_substation_power
-- security_invoker: RLS applies, so an SO only sees its own grid
-- prequalifications and the CUs it is CSO of
WITH (security_invoker = true) AS (
    WITH member AS (
        -- current CUs of each SPGGP's SPG, located at a substation and with
        -- the impacted SO as CSO
        SELECT
            gp.id AS gp_id,
            gp.impacted_system_operator_id AS so_id,
            gp.status,
            gp.prequalified_at,
            LOWER(spgm.valid_time_range) AS member_since,
            cu.id AS cu_id,
            cu.maximum_active_power AS power,
            apgl.business_id,
            apgl.name
        FROM flex.service_providing_group_grid_prequalification AS gp
            INNER JOIN flex.service_providing_group_membership AS spgm
                ON gp.service_providing_group_id = spgm.service_providing_group_id
                    AND spgm.valid_time_range @> current_timestamp
            INNER JOIN flex.controllable_unit AS cu
                ON spgm.controllable_unit_id = cu.id
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON cu.accounting_point_id = ap_so.accounting_point_id
                    AND ap_so.system_operator_id = gp.impacted_system_operator_id
                    AND ap_so.valid_time_range @> current_timestamp
            INNER JOIN flex.accounting_point_grid_location AS apgl
                ON cu.accounting_point_id = apgl.accounting_point_id
    ),

    total_approved AS (
        -- per SO and substation, over all approved SPGGPs. A CU in several
        -- approved SPGs is counted once, and CUs added after the approval
        -- are left out until the changes are approved (prequalified_at)
        SELECT
            so_id,
            business_id,
            SUM(power) AS power
        FROM (
            SELECT DISTINCT so_id, business_id, cu_id, power
            FROM member
            WHERE status IN ('approved', 'conditionally_approved')
                AND member_since <= prequalified_at
        ) AS approved_cu
        GROUP BY so_id, business_id
    )

    SELECT
        own.gp_id AS service_providing_group_grid_prequalification_id,
        own.so_id AS impacted_system_operator_id,
        own.business_id AS substation_business_id,
        MIN(own.name) AS substation_name,
        COUNT(*) AS controllable_unit_count,
        SUM(own.power) AS maximum_active_power,
        COALESCE(MAX(total.power), 0) AS total_approved_maximum_active_power
    FROM member AS own
        LEFT JOIN total_approved AS total
            ON own.so_id = total.so_id
                AND own.business_id = total.business_id
    GROUP BY own.gp_id, own.so_id, own.business_id
);

-- changeset flex:service-providing-group-grid-prequalification-substation-power-grants runOnChange:true endDelimiter:;
GRANT SELECT ON TABLE service_providing_group_grid_prequalification_substation_power TO flex_common;
