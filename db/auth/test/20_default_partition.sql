-- noqa: disable=all

BEGIN;
SELECT plan(3);

INSERT INTO auth.session (id, entity_id, expires_at)
VALUES ('00000000-0000-0000-0000-000000000020', 1, '2090-01-01 10:00+00');
INSERT INTO auth.token (token_hash, session_id, expires_at)
VALUES (sha256('far'), '00000000-0000-0000-0000-000000000020', '2090-01-01 10:00+00');

SELECT is(
    (SELECT tableoid::regclass::text FROM auth.token WHERE token_hash = sha256('far')),
    'auth.token_default',
    'a token outside every partition goes to the default partition'
);

SELECT throws_ok(
    $$CREATE UNLOGGED TABLE auth.token_p20900101 PARTITION OF auth.token
      FOR VALUES FROM ('2090-01-01 00:00:00+00') TO ('2090-01-02 00:00:00+00')$$,
    '23514',
    NULL,
    'a partition cannot be created over tokens sitting in the default partition'
);

DELETE FROM auth.session WHERE id = '00000000-0000-0000-0000-000000000020';
SELECT is(
    (SELECT count(*)::int FROM auth.token_default),
    0,
    'deleting the session empties the default partition'
);

SELECT finish();
ROLLBACK;
