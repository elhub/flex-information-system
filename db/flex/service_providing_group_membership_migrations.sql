--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-membership-grid-prequalification-trigger-delete runOnChange:true endDelimiter:;
-- TODO remove once rollout is complete
DROP TRIGGER IF EXISTS spgm_insert_grid_prequalification
ON flex.service_providing_group_membership;
DROP FUNCTION IF EXISTS flex.spgm_insert_grid_prequalification;
