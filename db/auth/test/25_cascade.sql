-- noqa: disable=all

BEGIN;
SELECT plan(5);

-- one session with several tokens, in two partitions
INSERT INTO auth.session (id, entity_id, expires_at)
VALUES ('00000000-0000-0000-0000-000000000030', 1, now() + interval '1 hour'),
       ('00000000-0000-0000-0000-000000000031', 2, now() + interval '1 hour');
INSERT INTO auth.token (token_hash, session_id, expires_at, used_at)
SELECT sha256(('a' || g)::bytea), '00000000-0000-0000-0000-000000000030', now() + interval '1 hour', now()
FROM generate_series(1, 360) AS g;
INSERT INTO auth.token (token_hash, session_id, expires_at)
VALUES (sha256('last'), '00000000-0000-0000-0000-000000000030', now() + interval '1 hour'),
       (sha256('other'), '00000000-0000-0000-0000-000000000031', now() + interval '1 hour');

SELECT is(
    (SELECT count(*)::int FROM auth.token WHERE session_id = '00000000-0000-0000-0000-000000000030'),
    361,
    'the session has its 361 tokens'
);

DELETE FROM auth.session WHERE id = '00000000-0000-0000-0000-000000000030';

SELECT is(
    (SELECT count(*)::int FROM auth.token WHERE session_id = '00000000-0000-0000-0000-000000000030'),
    0,
    'deleting a session deletes all its tokens, old and new'
);
SELECT is(
    (SELECT count(*)::int FROM auth.token WHERE token_hash = sha256('other')),
    1,
    'tokens of other sessions are kept'
);

DELETE FROM flex.entity WHERE id = 2;
SELECT is(
    (SELECT count(*)::int FROM auth.session WHERE entity_id = 2),
    0,
    'deleting an entity deletes its sessions'
);
SELECT is(
    (SELECT count(*)::int FROM auth.token WHERE token_hash = sha256('other')),
    0,
    'deleting an entity deletes the tokens of its sessions'
);

SELECT finish();
ROLLBACK;
