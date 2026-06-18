--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:substation-cluster-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.substation_cluster_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.substation_cluster',
            'id'
        )
    ),
    LIKE flex.substation_cluster,
    replaced_by bigint NOT NULL
);

-- changeset flex:substation-cluster-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
substation_cluster_history_id_idx
ON flex.substation_cluster_history (id);

-- changeset flex:substation-cluster-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.substation_cluster_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:substation-cluster-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
substation_cluster_audit_current
BEFORE INSERT OR UPDATE
ON flex.substation_cluster
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:substation-cluster-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
substation_cluster_audit_history
AFTER UPDATE OR DELETE
ON flex.substation_cluster
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
