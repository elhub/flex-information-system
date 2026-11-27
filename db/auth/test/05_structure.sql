-- noqa: disable=all

BEGIN;
SELECT plan(4);

SELECT has_table('auth', 'session', 'auth.session exists');
SELECT has_table('auth', 'token', 'auth.token exists');

-- today + 7 next days + yesterday + default
SELECT is(
    (SELECT count(*)::int FROM pg_inherits WHERE inhparent = 'auth.token'::regclass),
    10,
    'the initial maintenance created 9 daily partitions and the default one'
);

SELECT throws_ok(
    $$INSERT INTO auth.session (id, entity_id, expires_at)
      VALUES ('00000000-0000-0000-0000-000000000001', 1, now() + interval '1 hour');
      INSERT INTO auth.token (token_hash, session_id, expires_at)
      VALUES ('\x00', '00000000-0000-0000-0000-000000000001', now() + interval '1 hour')$$,
    '23514',
    NULL,
    'a token hash must be 32 bytes'
);

SELECT finish();
ROLLBACK;
