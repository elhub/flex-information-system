--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-prequalification-substation-power-drop runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'flex' AND table_name = 'service_providing_group_grid_prequalification_substation_power'
-- The feature was reverted. Liquibase does not remove objects of changesets that
-- are gone from the changelog, so drop them in dependency order: the embedding
-- functions, the api view and then the flex view.
DROP FUNCTION IF EXISTS api.service_providing_group_grid_prequalification(
    api.service_providing_group_grid_prequalification_substation_power
);
DROP FUNCTION IF EXISTS api.substation_power(
    api.service_providing_group_grid_prequalification
);
DROP VIEW IF EXISTS api.service_providing_group_grid_prequalification_substation_power;
DROP VIEW IF EXISTS flex.service_providing_group_grid_prequalification_substation_power;
