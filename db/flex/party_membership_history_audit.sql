--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:party-membership-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.party_membership_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party_membership',
            'id'
        )
    ),
    LIKE flex.party_membership,
    replaced_by bigint NOT NULL
);

-- changeset flex:party-membership-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
party_membership_history_id_idx
ON flex.party_membership_history (id);

-- changeset flex:party-membership-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.party_membership_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:party-membership-history-rls-com endDelimiter:--
-- RLS: PTYM-COM001
GRANT SELECT ON flex.party_membership_history
TO flex_common;

CREATE POLICY "PTYM_COM001"
ON flex.party_membership_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party_membership
    WHERE party_membership_history.id = party_membership.id -- noqa
));

-- changeset flex:party-membership-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
party_membership_audit_current
BEFORE INSERT OR UPDATE
ON flex.party_membership
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:party-membership-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
party_membership_audit_history
AFTER UPDATE OR DELETE
ON flex.party_membership
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
