--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:party-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.party_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party',
            'id'
        )
    ),
    LIKE flex.party,
    replaced_by bigint NOT NULL
);

-- changeset flex:party-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
party_history_id_idx
ON flex.party_history (id);

-- changeset flex:party-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.party_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:party-history-rls-com runAlways:true endDelimiter:--
-- RLS: PTY-COM001
GRANT SELECT ON flex.party_history
TO flex_common;

CREATE POLICY "PTY_COM001"
ON flex.party_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party
    WHERE party_history.id = party.id -- noqa
));

-- changeset flex:party-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
party_audit_current
BEFORE INSERT OR UPDATE
ON flex.party
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:party-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
party_audit_history
AFTER UPDATE OR DELETE
ON flex.party
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
