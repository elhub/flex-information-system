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

-- changeset flex:notice-sync-function runOnChange:true endDelimiter:--
-- synchronise the notice table with the fresh notice discovery
CREATE OR REPLACE FUNCTION notice_sync()
RETURNS TABLE (action text, id bigint)
SECURITY DEFINER
LANGUAGE sql AS $$
MERGE INTO flex.notice AS np  -- persistent notices
USING flex.notice_fresh AS nf -- freshly computed notices
ON np.party_id = nf.party_id
    AND np.type = nf.type
    AND np.source_resource = nf.source_resource
    AND np.source_id = nf.source_id
-- notices already registered and also recomputed must be updated
WHEN MATCHED AND (
    np.data IS DISTINCT FROM nf.data -- the data has changed
    OR np.status = 'resolved'        -- the notice must be reactivated
) THEN
    UPDATE SET
        data = nf.data,
        status = 'active'
-- notices already registered with no changes are not touched
WHEN MATCHED AND np.data = nf.data THEN DO NOTHING
-- notices already registered but not recomputed must be resolved
WHEN NOT MATCHED BY SOURCE THEN
    UPDATE SET
        status = 'resolved'
-- notices freshly computed but not registered must be created
WHEN NOT MATCHED BY TARGET THEN
    INSERT (
        party_id,
        type,
        source_resource,
        source_id,
        data,
        status
    ) VALUES (
        nf.party_id,
        nf.type,
        nf.source_resource,
        nf.source_id,
        nf.data,
        'active'
    )
RETURNING
    WITH OLD AS old_np, NEW AS new_np
    CASE merge_action()
        WHEN 'INSERT' THEN 'created'
        ELSE -- UPDATE
            CASE
                WHEN new_np.status = 'resolved' THEN 'resolved'
                WHEN new_np.status = 'active' AND old_np.status = 'resolved'
                    THEN 'reactivated'
                ELSE 'updated'
            END
    END AS action,
    np.id
$$;
