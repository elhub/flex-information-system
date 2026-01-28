--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-fresh-create runOnChange:true endDelimiter:;
-- DROP + CREATE instead of CREATE OR REPLACE: cf https://stackoverflow.com/a/65118443
-- This view combines all notice types from individual views.
-- Individual views are defined in separate files for maintainability.
DROP VIEW IF EXISTS notice_fresh CASCADE;
-- noqa: disable=AM04
CREATE VIEW notice_fresh
WITH (security_invoker = false) AS (
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
);
-- noqa: enable=AM04

-- changeset flex:notice-sync-function runAlways:true endDelimiter:--
-- synchronise the notice table with the fresh notice discovery
CREATE OR REPLACE FUNCTION notice_sync()
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM set_config('flex.current_identity', '0', false);

    MERGE INTO flex.notice AS np -- persistent notices
    USING flex.notice_fresh AS nf -- freshly computed notices
    ON np.party_id = nf.party_id
        AND np.type = nf.type
        AND np.deduplication_key = nf.deduplication_key
    -- resolved notices that are recomputed must be reactivated
    WHEN MATCHED AND np.status = 'resolved' THEN
        UPDATE SET
            data = nf.data,
            status = 'active'
    -- active notices with data changes must be updated
    WHEN MATCHED AND np.data IS DISTINCT FROM nf.data THEN
        UPDATE SET
            data = nf.data,
            status = 'active'
    -- notices freshly computed but not registered must be created
    WHEN NOT MATCHED /* BY TARGET */ THEN
        INSERT (
            party_id,
            type,
            deduplication_key,
            source_resource,
            source_id,
            data,
            status
        ) VALUES (
            nf.party_id,
            nf.type,
            nf.deduplication_key,
            nf.source_resource,
            nf.source_id,
            nf.data,
            'active'
        );

    -- notices already registered but not recomputed must be resolved
    -- NB: this is the 'NOT MATCHED BY SOURCE' part, available only in PG>=17
    -- WHEN NOT MATCHED BY SOURCE THEN
    --     UPDATE SET status = 'resolved';
    UPDATE flex.notice AS np
    SET status = 'resolved'
    WHERE NOT EXISTS (
        SELECT 1 FROM flex.notice_fresh AS nf
        WHERE nf.party_id = np.party_id
            AND nf.type = np.type
            AND nf.deduplication_key = np.deduplication_key
    );
END;
$$;
