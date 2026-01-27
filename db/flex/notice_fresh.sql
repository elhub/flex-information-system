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
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    MERGE INTO flex.notice AS np -- persistent notices
    USING flex.notice_fresh AS nf -- freshly computed notices
    ON np.key = nf.key
    -- notices already registered and also recomputed must be updated
    WHEN MATCHED AND (
        np.data IS DISTINCT FROM nf.data -- the data has changed
        OR np.status = 'resolved'        -- the notice must be reactivated
    ) THEN
        UPDATE SET
            data = nf.data,
            status = 'active';

    -- notices already registered with no changes are not touched
    -- NB: useless to add to the current MERGE as it is the last clause
    -- WHEN MATCHED AND np.data = nf.data THEN DO NOTHING

    -- notices already registered but not recomputed must be resolved
    -- NB: this is the 'NOT MATCHED [BY SOURCE]' part, where UPDATE statements
    --     are available only in PG>=17
    UPDATE flex.notice AS np
    SET status = 'resolved'
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.notice_fresh AS nf
        WHERE nf.key = np.key
    );

    -- notices freshly computed but not registered must be created
    -- NB: this is the 'NOT MATCHED BY TARGET' part, available only in PG>=17
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
        WHERE np.key = nf.key
    );
END;
$$;

-- changeset flex:notice-sync-job-schedule runAlways:true endDelimiter:;
-- schedule the job
SELECT cron.schedule(
    'notice-sync',
    '*/5 * * * *', -- every 5 minutes
    $$SELECT flex.notice_sync()$$
);
