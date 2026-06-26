--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04
-- RF04 - Keywords should not be used as identifiers.

-- changeset flex:grid-substation-create endDelimiter:-- runOnChange:true
DROP VIEW IF EXISTS
grid.substation
CASCADE;
CREATE OR REPLACE VIEW
grid.substation
WITH (security_invoker = true) AS (
    SELECT
        id,
        business_id,
        business_id_type,
        kind,
        name,
        st_asgeojson(position, 9, 0)::jsonb AS position,
        primary_concessionaire,
        status,
        substation_cluster_id,
        voltage_levels,
        recorded_by,
        lower(record_time_range) AS recorded_at
    FROM flex.substation
);
