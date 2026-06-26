--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04
-- RF04 - Keywords should not be used as identifiers.

-- changeset flex:grid-substation-cluster-create endDelimiter:-- runOnChange:true
DROP VIEW IF EXISTS
grid.substation_cluster
CASCADE;
CREATE OR REPLACE VIEW
grid.substation_cluster
WITH (security_invoker = true) AS (
    SELECT
        id,
        st_asgeojson(area, 9, 0)::jsonb AS area,
        st_asgeojson(averaged_position, 9, 0)::jsonb AS averaged_position,
        business_id,
        business_id_type,
        name,
        status,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.substation_cluster
);
