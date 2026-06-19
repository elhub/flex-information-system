--liquibase formatted sql
-- Manually managed file

-- changeset flex:grid-substation-distance endDelimiter:-- runOnChange:true
-- substations ordered by distance to a given point
CREATE OR REPLACE FUNCTION grid.substation_distance(
    longitude double precision,
    latitude double precision
)
RETURNS SETOF grid.substation
SECURITY INVOKER
IMMUTABLE
LANGUAGE sql
AS $$
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
ORDER BY position <-> ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
$$;
