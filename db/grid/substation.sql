--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

-- changeset flex:grid-substation-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
grid.substation
WITH (security_invoker = true) AS (
    SELECT
        id,
        recorded_by,
        lower(record_time_range) AS recorded_at,
        name,
        business_id,
        business_id_type,
        kind,
        primary_concessionaire,
        substation_cluster_id,
        voltage_levels,
        st_asgeojson(position, 9, 0)::jsonb AS position,
        status
    FROM flex.substation
);
