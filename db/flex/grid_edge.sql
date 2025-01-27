CREATE TABLE IF NOT EXISTS grid_edge (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text,
    parent_node_id bigint NOT NULL,
    child_node_id bigint NOT NULL,
    CONSTRAINT fk_grid_edge_parent_node_id FOREIGN KEY (
        parent_node_id
    ) REFERENCES grid_node (id),
    CONSTRAINT fk_grid_edge_child_node_id FOREIGN KEY (
        child_node_id
    ) REFERENCES grid_node (id),
    CONSTRAINT check_grid_edge_name_length CHECK ((char_length(name) <= 128))
);

COMMENT ON TABLE grid_edge IS
$$Grid edge in grid model

A grid edge is a connection between two grid nodes.
The direction is set by using parent and child node id.$$;
COMMENT ON COLUMN grid_edge.id IS 'Grid edge internal surrogate key.';
COMMENT ON COLUMN grid_edge.name IS 'The name of the edge.';
COMMENT ON COLUMN grid_edge.parent_node_id IS 'The node at the end of the edge that is considered to be "higher up" in the grid.';
COMMENT ON COLUMN grid_edge.child_node_id IS 'The node at the end of the edge that is considered to be at a "lower" level in the grid.';
