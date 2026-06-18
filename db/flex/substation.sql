--liquibase formatted sql
-- Manually managed file

-- changeset flex:substation-create runOnChange:true endDelimiter:--
CREATE TABLE IF NOT EXISTS substation (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    business_id text NOT NULL UNIQUE,
    business_id_type text NOT NULL DEFAULT 'uuid' REFERENCES business_id_type (name),
    kind text NOT NULL,
    primary_concessionaire text NOT NULL,
    substation_cluster_id bigint NOT NULL,
    voltage_levels numeric(9, 3) [] NOT NULL,
    position GEOMETRY (POINT, 4326) NOT NULL,
    status text NOT NULL DEFAULT 'active',
    record_time_range tstzrange NOT NULL DEFAULT tstzrange(
        localtimestamp, null, '[)'
    ),
    recorded_by bigint NOT NULL DEFAULT current_identity(),
    CONSTRAINT substation_business_id_check CHECK (
        validate_business_id(business_id, 'uuid')
    ),
    CONSTRAINT substation_business_id_type_check CHECK (
        business_id_type = 'uuid'
    ),
    CONSTRAINT substation_kind_check CHECK (
        kind IN ('coupling', 'junction', 'power', 'transformer')
    ),
    CONSTRAINT substation_status_check CHECK (
        status IN ('active', 'inactive')
    ),
    CONSTRAINT fk_substation_substation_cluster FOREIGN KEY (
        substation_cluster_id
    ) REFERENCES substation_cluster (id)
);

-- changeset flex:substation-active-transformer-position-index runOnChange:false runInTransaction:false endDelimiter:;
CREATE INDEX CONCURRENTLY IF NOT EXISTS
substation_active_transformer_position_idx
ON flex.substation USING gist (position)
WHERE kind = 'transformer' AND status = 'active';
