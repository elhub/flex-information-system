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

COMMENT ON TABLE grid_node IS
$$Grid node in grid model

A grid node is a location in the grid, typically a transformer or similar.$$;

COMMENT ON COLUMN grid_node.id IS 'Grid node internal surrogate key.';
COMMENT ON COLUMN grid_node.name IS 'The name of the grid node.';
COMMENT ON COLUMN grid_node.system_operator_id IS 'The system operator that is responsible for the grid node.';
