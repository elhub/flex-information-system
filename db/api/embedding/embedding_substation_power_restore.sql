--liquibase formatted sql
-- Manually managed file

-- The embedding functions of the substation power view were dropped together
-- with the view when the feature was reverted. The generated changesets in
-- embedding.sql are unchanged, so Liquibase skips them where they already ran.
-- These changesets recreate the functions and their grants.

-- changeset flex:substation-power-embedding-restore-spggp endDelimiter:--
CREATE OR REPLACE FUNCTION api.service_providing_group_grid_prequalification(
    api.service_providing_group_grid_prequalification_substation_power
)
RETURNS SETOF api.service_providing_group_grid_prequalification ROWS 1 AS $$
  select *
  from api.service_providing_group_grid_prequalification
  where id = $1.service_providing_group_grid_prequalification_id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION
api.service_providing_group_grid_prequalification(
    api.service_providing_group_grid_prequalification_substation_power
)
TO flex_common, flex_entity;

-- changeset flex:substation-power-embedding-restore-substation-power endDelimiter:--
CREATE OR REPLACE FUNCTION api.substation_power(
    api.service_providing_group_grid_prequalification
)
RETURNS SETOF api.service_providing_group_grid_prequalification_substation_power AS $$
  select *
  from api.service_providing_group_grid_prequalification_substation_power
  where service_providing_group_grid_prequalification_id = $1.id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION
api.substation_power(
    api.service_providing_group_grid_prequalification
)
TO flex_common, flex_entity;
