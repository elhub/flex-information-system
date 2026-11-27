-- noqa: disable=all

BEGIN;
SELECT plan(8);

-- an old session with an old partition holding its token
CREATE UNLOGGED TABLE auth.token_p20250101 PARTITION OF auth.token
FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2025-01-02 00:00:00+00');
INSERT INTO auth.session (id, entity_id, expires_at)
VALUES ('00000000-0000-0000-0000-000000000010', 1, '2025-01-01 10:00+00');
INSERT INTO auth.token (token_hash, session_id, expires_at)
VALUES (sha256('old'), '00000000-0000-0000-0000-000000000010', '2025-01-01 10:00+00');

-- a current session that must survive
INSERT INTO auth.session (id, entity_id, expires_at)
VALUES ('00000000-0000-0000-0000-000000000011', 1, now() + interval '1 hour');
INSERT INTO auth.token (token_hash, session_id, expires_at)
VALUES (sha256('new'), '00000000-0000-0000-0000-000000000011', now() + interval '1 hour');

SELECT lives_ok('SELECT auth.session_maintenance()', 'maintenance runs');
SELECT lives_ok('SELECT auth.session_maintenance()', 'maintenance can run twice');

SELECT hasnt_table('auth', 'token_p20250101', 'the old partition, with its token, is dropped');
SELECT is(
    (SELECT count(*)::int FROM auth.session WHERE id = '00000000-0000-0000-0000-000000000010'),
    0,
    'the old session is deleted'
);
SELECT is(
    (SELECT count(*)::int FROM auth.session WHERE id = '00000000-0000-0000-0000-000000000011'),
    1,
    'the current session is kept'
);
SELECT is(
    (SELECT count(*)::int FROM auth.token WHERE session_id = '00000000-0000-0000-0000-000000000011'),
    1,
    'the current token is kept'
);

SELECT is(
    (SELECT count(*)::int FROM pg_inherits WHERE inhparent = 'auth.token'::regclass),
    10,
    'there are 9 daily partitions and the default one'
);

DO $$ BEGIN
    EXECUTE format(
        'DROP TABLE auth.token_p%s',
        to_char((current_timestamp AT TIME ZONE 'UTC')::date + 3, 'YYYYMMDD')
    );
END $$;
SELECT auth.session_maintenance();
SELECT has_table(
    'auth',
    'token_p' || to_char((current_timestamp AT TIME ZONE 'UTC')::date + 3, 'YYYYMMDD'),
    'a missing partition is created again'
);

SELECT finish();
ROLLBACK;
