--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:technical-resource-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.technical_resource_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.technical_resource',
            'id'
        )
    ),
    LIKE flex.technical_resource,
    replaced_by bigint NOT NULL
);

-- changeset flex:technical-resource-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
technical_resource_history_id_idx
ON flex.technical_resource_history (id);

-- changeset flex:technical-resource-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.technical_resource_history
ENABLE ROW LEVEL SECURITY;



-- changeset flex:technical-resource-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
technical_resource_audit_current
BEFORE INSERT OR UPDATE
ON flex.technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:technical-resource-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
technical_resource_audit_history
AFTER UPDATE OR DELETE
ON flex.technical_resource
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
