-- AUTO-GENERATED FILE (scripts/openapi_to_db.py)

CREATE TABLE IF NOT EXISTS
party_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.party',
            'id'
        )
    ),
    LIKE party,
    replaced_by bigint NOT NULL
);

CREATE INDEX IF NOT EXISTS
party_history_id_idx
ON party_history (id);

CREATE OR REPLACE TRIGGER
party_history
BEFORE INSERT OR UPDATE OR DELETE
ON party
FOR EACH ROW EXECUTE PROCEDURE flex.versioning(
    'record_time_range',
    'flex.party_history',
    true
);

CREATE OR REPLACE TRIGGER
party_replaced_by
BEFORE INSERT ON party_history
FOR EACH ROW EXECUTE PROCEDURE flex.replaced_by();

ALTER TABLE IF EXISTS party_history
ENABLE ROW LEVEL SECURITY;

-- RLS: PTY-COM001
GRANT SELECT ON party_history
TO flex_common;
CREATE POLICY "PTY_COM001"
ON party_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM party
    WHERE party_history.id = party.id -- noqa
));

CREATE OR REPLACE TRIGGER
party_recorded_by
BEFORE INSERT OR UPDATE ON party
FOR EACH ROW EXECUTE PROCEDURE flex.recorded_by();
