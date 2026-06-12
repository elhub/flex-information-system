--liquibase formatted sql
-- Manually managed file

-- changeset flex:substation-cluster-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS substation_cluster (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    business_id text NOT NULL UNIQUE,
    business_id_type text NOT NULL DEFAULT 'uuid' REFERENCES business_id_type (name),
    averaged_position GEOMETRY (POINT, 4326) NOT NULL,
    area GEOMETRY (POLYGON, 4326) NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT substation_cluster_business_id_check CHECK (
        validate_business_id(business_id, 'uuid')
    ),
    CONSTRAINT substation_cluster_business_id_type_check CHECK (
        business_id_type = 'uuid'
    )
);
