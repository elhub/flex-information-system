--liquibase formatted sql
-- Manually managed file

-- changeset flex:grid-node runOnChange:false endDelimiter:--
CREATE TABLE IF NOT EXISTS grid_node (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    system_operator_id bigint NOT NULL,
    system_operator_party_type text GENERATED ALWAYS AS (
        'system_operator'
    ) STORED,
    CONSTRAINT fk_grid_node_system_operator FOREIGN KEY (
        system_operator_id, system_operator_party_type
    ) REFERENCES party (id, type),
    CONSTRAINT check_grid_node_name_length CHECK ((char_length(name) <= 128))
);
