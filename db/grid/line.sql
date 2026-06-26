--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04
-- RF04 - Keywords should not be used as identifiers.

-- changeset flex:grid-line-create endDelimiter:-- runOnChange:true
DROP VIEW IF EXISTS
grid.line
CASCADE;
CREATE OR REPLACE VIEW
grid.line
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        from_substation_cluster_id,
        st_asgeojson(line, 9, 0)::jsonb AS line,
        name,
        status,
        to_substation_cluster_id,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.line
);
