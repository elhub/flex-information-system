--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:grid-line-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
grid.line
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        name,
        business_id,
        business_id_type,
        from_substation_cluster_id,
        to_substation_cluster_id,
        st_asgeojson(line, 9, 0)::jsonb AS line,
        status
    FROM flex.line
);
