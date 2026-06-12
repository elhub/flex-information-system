--liquibase formatted sql
-- Manually managed file

-- changeset flex:line-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS line (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    business_id text NOT NULL UNIQUE,
    business_id_type text NOT NULL DEFAULT 'uuid' REFERENCES business_id_type (name),
    from_substation_cluster_id bigint NOT NULL,
    to_substation_cluster_id bigint NOT NULL,
    line GEOMETRY (LINESTRING, 4326) NOT NULL,
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT line_business_id_check CHECK (
        validate_business_id(business_id, 'uuid')
    ),
    CONSTRAINT line_business_id_type_check CHECK (
        business_id_type = 'uuid'
    ),
    CONSTRAINT fk_line_from_substation_cluster FOREIGN KEY (
        from_substation_cluster_id
    ) REFERENCES substation_cluster (id),
    CONSTRAINT fk_line_to_substation_cluster FOREIGN KEY (
        to_substation_cluster_id
    ) REFERENCES substation_cluster (id)
);
