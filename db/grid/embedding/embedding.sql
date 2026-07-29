--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

-- changeset flex:substation-substation_cluster_id-to-substation_cluster runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION grid.substation_cluster(
    grid.substation
)
RETURNS SETOF grid.substation_cluster ROWS 1 AS $$
  select * from grid.substation_cluster where id = $1.substation_cluster_id
$$ STABLE LANGUAGE sql;

-- changeset flex:substation-substation_cluster_id-to-substation_cluster-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
grid.substation_cluster(grid.substation)
TO flex_common, flex_entity;

-- changeset flex:substation_cluster-id-to-substation runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION grid.substation(
    grid.substation_cluster
)
RETURNS SETOF grid.substation AS $$
  select * from grid.substation where substation_cluster_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:substation_cluster-id-to-substation-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
grid.substation(grid.substation_cluster)
TO flex_common, flex_entity;

-- changeset flex:line-from_substation_cluster_id-to-substation_cluster runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION grid.from_substation_cluster(
    grid.line
)
RETURNS SETOF grid.substation_cluster ROWS 1 AS $$
  select * from grid.substation_cluster where id = $1.from_substation_cluster_id
$$ STABLE LANGUAGE sql;

-- changeset flex:line-from_substation_cluster_id-to-substation_cluster-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
grid.from_substation_cluster(grid.line)
TO flex_common, flex_entity;

-- changeset flex:substation_cluster-id-to-line runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION grid.line(
    grid.substation_cluster
)
RETURNS SETOF grid.line AS $$
  select * from grid.line where from_substation_cluster_id = $1.id
$$ STABLE LANGUAGE sql;

-- changeset flex:substation_cluster-id-to-line-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
grid.line(grid.substation_cluster)
TO flex_common, flex_entity;

-- changeset flex:line-to_substation_cluster_id-to-substation_cluster runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION grid.to_substation_cluster(
    grid.line
)
RETURNS SETOF grid.substation_cluster ROWS 1 AS $$
  select * from grid.substation_cluster where id = $1.to_substation_cluster_id
$$ STABLE LANGUAGE sql;

-- changeset flex:line-to_substation_cluster_id-to-substation_cluster-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
grid.to_substation_cluster(grid.line)
TO flex_common, flex_entity;
