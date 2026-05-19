--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-sync-view runOnChange:true endDelimiter:--
-- (SPG, ISO) pairs for which a SPG-GP record should exist in the DB
CREATE OR REPLACE VIEW flex.service_providing_group_grid_prequalification_v
WITH (security_invoker = false) AS (
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
    WHERE spgpa.status NOT IN ('requested', 'rejected')
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
        );
    -- TODO: missing in the view -> [soft-]delete the SPG-GP?
    -- WHEN NOT MATCHED BY SOURCE THEN
    --     DELETE;
END;
$$;

-- changeset flex:service-providing-group-grid-prequalification-sync-job runAlways:true endDelimiter:;
SELECT cron.schedule(
    'service-providing-group-grid-prequalification-sync',
    '47 2 * * *', -- every night at 02:47
    $$SELECT flex.service_providing_group_grid_prequalification_sync()$$
);
