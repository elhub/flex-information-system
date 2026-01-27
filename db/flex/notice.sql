--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice runAlways:true endDelimiter:;
-- DROP + CREATE instead of CREATE OR REPLACE: cf https://stackoverflow.com/a/65118443
-- This view combines all notice types from individual views.
-- Individual views are defined in separate files for maintainability.
DROP VIEW IF EXISTS notice CASCADE;
-- noqa: disable=AM04
CREATE VIEW notice
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
