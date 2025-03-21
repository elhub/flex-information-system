-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
party_membership_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party_membership',
            'id'
        )
    ),
    LIKE party_membership,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
party_membership_history_id_idx
ON party_membership_history (id);

CREATE OR REPLACE TRIGGER
party_membership_audit_history
AFTER INSERT OR UPDATE OR DELETE
ON party_membership
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);

ALTER TABLE IF EXISTS party_membership_history
ENABLE ROW LEVEL SECURITY;

-- RLS: PTYM-COM001
GRANT SELECT ON party_membership_history
TO flex_common;
CREATE POLICY "PTYM_COM001"
ON party_membership_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party_membership
    WHERE party_membership_history.id = party_membership.id -- noqa
));

CREATE OR REPLACE TRIGGER
party_membership_audit_current
BEFORE INSERT OR UPDATE ON party_membership
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);
