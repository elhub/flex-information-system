--liquibase formatted sql
-- Manually managed file

-- changeset flex:grid-edge runOnChange:false endDelimiter:--
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
