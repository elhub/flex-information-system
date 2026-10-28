--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-sync-view runOnChange:true endDelimiter:--
-- (SPG, ISO) pairs for which a SPG-GP record should exist in the DB
CREATE OR REPLACE VIEW flex.service_providing_group_grid_prequalification_v
WITH (security_invoker = false) AS (
    -- the PSO of a SPGPA grid-prequalifies the SPG, as long as the SPG has
    -- at least one current/future CU (an empty SPG has nothing to prequalify)
    SELECT DISTINCT
        spgpa_pso.service_providing_group_id,
        spgpa_pso.procuring_system_operator_id AS impacted_system_operator_id
    FROM flex.service_providing_group_product_application AS spgpa_pso
        -- current/future memberships on the SPG
        INNER JOIN flex.service_providing_group_membership AS spgm_pso
            ON
                spgpa_pso.service_providing_group_id
                = spgm_pso.service_providing_group_id
                AND (
                    upper(spgm_pso.valid_time_range) IS null
                    OR upper(spgm_pso.valid_time_range) > current_timestamp
                )
        -- associated CUs
        INNER JOIN flex.controllable_unit AS cu_pso
            ON spgm_pso.controllable_unit_id = cu_pso.id
    -- the SPG-PA is being processed so the PSO should grid-prequalify the SPG
    WHERE spgpa_pso.status NOT IN ('requested', 'rejected', 'inactive')

    UNION

    SELECT DISTINCT
        spgpa.service_providing_group_id,
        ap_so.system_operator_id AS impacted_system_operator_id
    FROM flex.service_providing_group_product_application AS spgpa
        -- current/future memberships on the SPG
        INNER JOIN flex.service_providing_group_membership AS spgm
            ON
                spgpa.service_providing_group_id
                = spgm.service_providing_group_id
                AND (
                    upper(spgm.valid_time_range) IS null
                    OR upper(spgm.valid_time_range) > current_timestamp
                )
        -- associated CUs
        INNER JOIN flex.controllable_unit AS cu
            ON spgm.controllable_unit_id = cu.id
        -- TODO: add extra checks on the CU?
        -- (e.g. sum MAP under a given threshold, a given technology in the TR)
        -- CSOs on the CUs when they are in the SPG
        -- TODO: update when ISO is better defined (grid model)
        INNER JOIN flex.accounting_point_system_operator AS ap_so
            ON
                cu.accounting_point_id = ap_so.accounting_point_id
                AND spgm.valid_time_range && ap_so.valid_time_range
    -- the SPG-PA is being processed so the CSO should grid-prequalify the SPG
    WHERE spgpa.status NOT IN ('requested', 'rejected', 'inactive')
);

-- changeset flex:service-providing-group-grid-prequalification-sync-function runOnChange:true endDelimiter:--
-- sync SPG-GP table based on the view above (expected SPG-GP)
CREATE OR REPLACE FUNCTION
flex.service_providing_group_grid_prequalification_sync()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS
$$
BEGIN
    MERGE INTO flex.service_providing_group_grid_prequalification AS flex_spggp
    USING flex.service_providing_group_grid_prequalification_v AS expected_spggp
        ON flex_spggp.service_providing_group_id
        = expected_spggp.service_providing_group_id
            AND flex_spggp.impacted_system_operator_id
            = expected_spggp.impacted_system_operator_id
    -- the SPG-ISO pair is expected again -> reactivate the soft-deleted row
    WHEN MATCHED AND flex_spggp.status = 'inactive' THEN
        UPDATE SET status = 'requested'
    -- missing in the table -> insert
    WHEN NOT MATCHED BY TARGET THEN
        INSERT (
            service_providing_group_id,
            impacted_system_operator_id,
            recorded_by
        ) VALUES (
            expected_spggp.service_providing_group_id,
            expected_spggp.impacted_system_operator_id,
            0 -- system
        )
    -- soft delete the SPG-GP when no CU of the SPG is (or will be) under the
    -- ISO as CSO anymore (CU removed from the SPG, membership ended, CSO changed)
    WHEN NOT MATCHED BY SOURCE
        AND flex_spggp.status != 'inactive'
        AND NOT EXISTS (
            SELECT 1
            FROM flex.service_providing_group_membership AS spgm
                INNER JOIN flex.controllable_unit AS cu
                    ON spgm.controllable_unit_id = cu.id
                INNER JOIN flex.accounting_point_system_operator AS ap_so
                    ON
                        cu.accounting_point_id = ap_so.accounting_point_id
                        AND spgm.valid_time_range && ap_so.valid_time_range
            WHERE spgm.service_providing_group_id
                = flex_spggp.service_providing_group_id
                AND ap_so.system_operator_id
                = flex_spggp.impacted_system_operator_id
                AND (
                    upper(spgm.valid_time_range) IS null
                    OR upper(spgm.valid_time_range) > current_timestamp
                )
        ) THEN
        UPDATE SET status = 'inactive';
END;
$$;

-- changeset flex:service-providing-group-grid-prequalification-sync-job runOnChange:false endDelimiter:;
SELECT cron.schedule(
    'service-providing-group-grid-prequalification-sync',
    '47 2 * * *', -- every night at 02:47
    $$SELECT flex.service_providing_group_grid_prequalification_sync()$$
);

-- changeset flex:service-providing-group-grid-prequalification-sync-job-alter runOnChange:true endDelimiter:;
SELECT cron.alter_job(
    (
        SELECT jobid FROM cron.job
        WHERE jobname = 'service-providing-group-grid-prequalification-sync'
    ),
    '47 * * * *' -- every hour at minute 47
);
