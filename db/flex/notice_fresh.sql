--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-fresh-create runOnChange:true endDelimiter:--
-- DROP + CREATE instead of CREATE OR REPLACE: cf https://stackoverflow.com/a/65118443
-- This view combines all notice types from individual views.
-- Individual views are defined in separate files for maintainability.
DROP VIEW IF EXISTS notice_fresh CASCADE;
-- noqa: disable=AM04
CREATE VIEW notice_fresh
WITH (security_invoker = false) AS (
    SELECT
        nf.*,
        flex.notice_key(
            nf.party_id,
            nf.type,
            nf.source_resource,
            nf.source_id,
            nf.data
        ) AS key -- noqa
    FROM (
        -- Controllable Unit notices
        SELECT * FROM notice_cu_grid_node_id_missing
        UNION ALL
        SELECT * FROM notice_cu_grid_validation_status_pending
        UNION ALL
        SELECT * FROM notice_cu_grid_validation_status_incomplete_information

        -- Controllable Unit Service Provider notices
        UNION ALL
        SELECT * FROM notice_cusp_valid_time_outside_contract

        -- Controllable Unit Suspension notices
        UNION ALL
        SELECT * FROM notice_cus_not_active
        UNION ALL
        SELECT * FROM notice_cus_lingering

        -- Service Provider Product Application notices
        UNION ALL
        SELECT * FROM notice_sppa_status_requested

        -- Service Provider Product Suspension notices
        UNION ALL
        SELECT * FROM notice_spps_product_type_not_qualified
        UNION ALL
        SELECT * FROM notice_spps_lingering

        -- Service Providing Group notices
        UNION ALL
        SELECT * FROM notice_spg_brp_multiple

        -- Service Providing Group Membership notices
        UNION ALL
        SELECT * FROM notice_spgm_valid_time_outside_contract
        UNION ALL
        SELECT * FROM notice_spgm_bidding_zone_mismatch

        -- Service Providing Group Product Application notices
        UNION ALL
        SELECT * FROM notice_spgpa_status_requested

        -- Service Providing Group Grid Prequalification notices
        UNION ALL
        SELECT * FROM notice_spggp_status_requested

        -- Service Providing Group Grid Suspension notices
        UNION ALL
        SELECT * FROM notice_spggs_not_grid_prequalified
        UNION ALL
        SELECT * FROM notice_spggs_lingering

        -- Service Providing Group Product Suspension notices
        UNION ALL
        SELECT * FROM notice_spgps_product_type_not_qualified
        UNION ALL
        SELECT * FROM notice_spgps_lingering

        -- Party notices
        UNION ALL
        SELECT * FROM notice_party_missing
        UNION ALL
        SELECT * FROM notice_party_outdated
        UNION ALL
        SELECT * FROM notice_party_residual
    ) AS nf
);
-- noqa: enable=AM04

-- changeset flex:notice-sync-function runOnChange:true endDelimiter:--
-- synchronise the notice table with the fresh notice discovery
CREATE OR REPLACE FUNCTION notice_sync()
RETURNS TABLE (action text, id bigint)
SECURITY DEFINER
LANGUAGE sql AS $$
    WITH
        -- notices already registered but not recomputed must be resolved
        resolved AS (
            UPDATE flex.notice AS np
            SET status = 'resolved'
            WHERE np.status = 'active'
                AND NOT EXISTS (
                    SELECT 1 FROM flex.notice_fresh AS nf
                    WHERE nf.party_id IS NOT DISTINCT FROM np.party_id
                        AND nf.type = np.type
                        AND nf.source_resource = np.source_resource
                        AND nf.source_id = np.source_id
                )
            RETURNING 'resolved'::text AS action, np.id
        ),
        -- resolved notices that are recomputed must be reactivated
        reactivated AS (
            UPDATE flex.notice AS np
            SET
                status = 'active',
                data = nf.data -- update data BTW if necessary
            FROM flex.notice_fresh AS nf
            WHERE nf.party_id IS NOT DISTINCT FROM np.party_id
                AND nf.type = np.type
                AND nf.source_resource = np.source_resource
                AND nf.source_id = np.source_id
                AND np.status = 'resolved'
                -- if a notice is resolved by the query above, it should not be
                -- taken into account here
                AND NOT EXISTS (
                    SELECT 1 FROM resolved AS nr
                    WHERE nr.id = np.id
                )
            RETURNING 'reactivated'::text AS action, np.id
        ),
        -- notices already registered with change in data must be updated
        updated AS (
            UPDATE flex.notice AS np
            SET data = nf.data
            FROM flex.notice_fresh AS nf
            WHERE nf.party_id IS NOT DISTINCT FROM np.party_id
                AND nf.type = np.type
                AND nf.source_resource = np.source_resource
                AND nf.source_id = np.source_id
                AND np.data IS DISTINCT FROM nf.data
                -- if already handled by reactivation, do not consider updated
                AND NOT EXISTS (
                    SELECT 1 FROM reactivated AS nr
                    WHERE nr.id = np.id
                )
            RETURNING 'updated'::text AS action, np.id
        ),
        -- notices freshly computed but not registered must be created
        -- NB: this one can run concurrently with the others because they all
        --     consider notices that match between the table and the view,
        --     so the cases handled here (new in the view, missing from table)
        --     will never have been handled before
        created AS (
            INSERT INTO flex.notice (
                party_id,
                type,
                source_resource,
                source_id,
                data,
                status
            )
            SELECT
                nf.party_id,
                nf.type,
                nf.source_resource,
                nf.source_id,
                nf.data,
                'active'
            FROM flex.notice_fresh AS nf
            WHERE NOT EXISTS (
                SELECT 1 FROM flex.notice AS np
                WHERE np.party_id IS NOT DISTINCT FROM nf.party_id
                    AND np.type = nf.type
                    AND np.source_resource = nf.source_resource
                    AND np.source_id = nf.source_id
            )
            RETURNING 'created'::text AS action, id
        )

    SELECT * FROM resolved
    UNION ALL
    SELECT * FROM reactivated
    UNION ALL
    SELECT * FROM updated
    UNION ALL
    SELECT * FROM created
$$;

-- changeset flex:notice-sync-job runOnChange:true endDelimiter:--
-- job definition: identify as system, then sync and log the changes
CREATE OR REPLACE FUNCTION notice_sync_job()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql AS $$
DECLARE
  l_notice_change record;
BEGIN
    RAISE NOTICE 'Starting notice synchronisation job...';
    PERFORM set_config('flex.current_identity', '0', false);
    FOR l_notice_change IN
        SELECT * FROM flex.notice_sync()
    LOOP
        RAISE NOTICE
            'Notice % was %',
            l_notice_change.id,
            l_notice_change.action;
    END LOOP;
    RAISE NOTICE 'End of notice synchronisation job.';
END;
$$;

-- changeset flex:notice-sync-job-schedule runAlways:true endDelimiter:;
-- schedule the job
SELECT cron.schedule(
    'notice-sync',
    '*/5 * * * *', -- every 5 minutes
    $$SELECT flex.notice_sync_job()$$
);
