--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-grid-prequalification runOnChange:true endDelimiter:--

-- SPG grid prequalification status requested
CREATE OR REPLACE VIEW notice_spggp_status_requested
WITH (security_invoker = false) AS (
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested'::ltree AS type, -- noqa
        'service_providing_group_grid_prequalification' AS source_resource,
        spggp.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spggp.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_grid_prequalification AS spggp
    WHERE spggp.status = 'requested'
);

-- changeset flex:notice-service-providing-group-grid-prequalification-snapshot-function runOnChange:true endDelimiter:--
-- CUs in a SPG as known and valid at a given point in time, limited to those
-- whose accounting point currently has the given system operator (CSO).
-- If the system operator is the procuring system operator (PSO) on a product
-- application of the SPG, it is responsible for the whole group: all CUs are
-- included.
CREATE OR REPLACE FUNCTION spg_cu_snapshot(
    in_service_providing_group_id bigint,
    in_system_operator_id bigint,
    in_at timestamptz
)
RETURNS TABLE (
    controllable_unit_id bigint,
    maximum_active_power numeric
)
STABLE
LANGUAGE plpgsql AS $$
DECLARE
    -- like the CSO, the PSO role is the current one, so that both sides of a
    -- comparison concern the same CUs
    v_is_pso boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application AS spgpa
        WHERE spgpa.service_providing_group_id = in_service_providing_group_id
            AND spgpa.procuring_system_operator_id = in_system_operator_id
    ) INTO v_is_pso;

    RETURN QUERY
    WITH
        spgm AS (
            SELECT
                m.controllable_unit_id
            FROM flex.service_providing_group_membership AS m
            WHERE m.service_providing_group_id = in_service_providing_group_id
                AND m.record_time_range @> in_at
                AND m.valid_time_range @> in_at
            UNION
            SELECT
                mh.controllable_unit_id
            FROM flex.service_providing_group_membership_history AS mh
            WHERE mh.service_providing_group_id = in_service_providing_group_id
                AND mh.record_time_range @> in_at
                AND mh.valid_time_range @> in_at
        ),

        cu AS (
            SELECT
                c.id,
                c.accounting_point_id,
                c.maximum_active_power
            FROM flex.controllable_unit AS c
            WHERE c.record_time_range @> in_at
            UNION ALL
            SELECT
                ch.id,
                ch.accounting_point_id,
                ch.maximum_active_power
            FROM flex.controllable_unit_history AS ch
            WHERE ch.record_time_range @> in_at
        )

    SELECT DISTINCT
        cu.id,
        cu.maximum_active_power::numeric
    FROM spgm
        INNER JOIN cu
            ON spgm.controllable_unit_id = cu.id
        LEFT JOIN flex.accounting_point_system_operator AS ap_so
            ON cu.accounting_point_id = ap_so.accounting_point_id
                -- the CSO is always the current one
                AND ap_so.valid_time_range @> current_timestamp
    WHERE v_is_pso OR ap_so.system_operator_id = in_system_operator_id;
END;
$$;

-- changeset flex:notice-service-providing-group-grid-prequalification-outdated runOnChange:true endDelimiter:--
-- SPG grid prequalification outdated: the SPG changed since it was approved,
-- i.e., the net change in maximum active power of the CUs (under the ISO, or
-- all CUs if the ISO is a PSO) since the grid prequalification exceeds 50 kW
CREATE OR REPLACE VIEW notice_spggp_outdated
WITH (security_invoker = false) AS (
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.outdated'::ltree AS type, -- noqa
        'service_providing_group_grid_prequalification' AS source_resource,
        spggp.id AS source_id,
        jsonb_build_object(
            'kind', 'notice.data.service_providing_group_grid_prequalification.outdated', -- noqa
            'prequalified_at', spggp.prequalified_at,
            'service_providing_group_id', spggp.service_providing_group_id,
            'added', diff.added,
            'removed', diff.removed,
            'changed', diff.changed,
            'maximum_active_power_diff', diff.power_diff
        ) AS data, -- noqa
        md5(spggp.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_grid_prequalification AS spggp
        CROSS JOIN LATERAL (
            SELECT
                coalesce(
                    sum(
                        coalesce(cur.maximum_active_power, 0)
                        - coalesce(old.maximum_active_power, 0)
                    ), 0
                ) AS power_diff,
                count(*) FILTER (WHERE old.controllable_unit_id IS null) AS added, -- noqa
                count(*) FILTER (WHERE cur.controllable_unit_id IS null) AS removed, -- noqa
                count(*) FILTER (
                    WHERE old.controllable_unit_id IS NOT null
                    AND cur.controllable_unit_id IS NOT null
                    AND old.maximum_active_power
                    IS DISTINCT FROM cur.maximum_active_power
                ) AS changed
            FROM flex.spg_cu_snapshot(
                    spggp.service_providing_group_id,
                    spggp.impacted_system_operator_id,
                    spggp.prequalified_at
                ) AS old -- noqa
                FULL JOIN
                    flex.spg_cu_snapshot(
                        spggp.service_providing_group_id,
                        spggp.impacted_system_operator_id,
                        current_timestamp
                    ) AS cur
                    ON old.controllable_unit_id = cur.controllable_unit_id
        ) AS diff
    WHERE spggp.status IN ('approved', 'conditionally_approved')
        AND spggp.prequalified_at IS NOT null
        -- kW
        AND abs(diff.power_diff) > 50
);
