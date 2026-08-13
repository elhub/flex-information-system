--liquibase formatted sql
-- Manually managed file

-- changeset flex:grid-substation-distance-old-remove endDelimiter:-- runOnChange:true
--- remove the old function
DROP FUNCTION IF EXISTS grid.substation_distance(double precision, double precision);
-- changeset flex:grid-substation-distance endDelimiter:-- runOnChange:true
-- substations ordered by distance to a given point
CREATE OR REPLACE FUNCTION grid.substation_distance(
    longitude double precision,
    latitude double precision
)
RETURNS TABLE (
    id bigint,
    recorded_by bigint,
    recorded_at timestamp with time zone,
    name text,
    business_id text,
    business_id_type text,
    kind text,
    primary_concessionaire text,
    substation_cluster_id bigint,
    voltage_levels numeric [],
    substation_position jsonb,
    status text,
    substation_cluster jsonb
)
SECURITY INVOKER
STABLE
LANGUAGE sql
AS $$
SELECT
    s.id,
    s.recorded_by,
    lower(s.record_time_range) AS recorded_at,
    s.name,
    s.business_id,
    s.business_id_type,
    s.kind,
    s.primary_concessionaire,
    s.substation_cluster_id,
    s.voltage_levels,
    st_asgeojson(s.position, 9, 0)::jsonb AS substation_position,
    s.status,
    jsonb_build_object(
        'id', sc.id,
        'area', st_asgeojson(sc.area, 9, 0)::jsonb,
        'name', sc.name,
        'status', sc.status,
        'business_id', sc.business_id,
        'recorded_at', lower(sc.record_time_range),
        'recorded_by', sc.recorded_by,
        'business_id_type', sc.business_id_type,
        'averaged_position', st_asgeojson(sc.averaged_position, 9, 0)::jsonb
    ) AS substation_cluster
FROM flex.substation s
LEFT JOIN flex.substation_cluster sc
    ON sc.id = s.substation_cluster_id
WHERE s.kind = 'transformer' AND sc.status = 'active'
ORDER BY s.position <-> ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
$$;

-- changeset flex:grid-substation-distance-grants runOnChange:true
GRANT EXECUTE ON FUNCTION grid.substation_distance(
    double precision, double precision
)
TO flex_flexibility_information_system_operator, flex_system_operator;
