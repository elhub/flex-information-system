-- noqa: disable=all

BEGIN;
SELECT plan(7);

SELECT table_privs_are('auth', 'session', 'flex_internal_auth', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'flex_internal_auth has full access to sessions');
SELECT table_privs_are('auth', 'token', 'flex_internal_auth', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE'], 'flex_internal_auth has full access to tokens');
SELECT table_privs_are('auth', 'session', 'flex_anonymous', ARRAY[]::text[], 'flex_anonymous has no access to sessions');
SELECT table_privs_are('auth', 'token', 'flex_anonymous', ARRAY[]::text[], 'flex_anonymous has no access to tokens');
SELECT table_privs_are('auth', 'token_default', 'flex_anonymous', ARRAY[]::text[], 'flex_anonymous has no access to the default partition');

SELECT function_privs_are('auth', 'session_maintenance', ARRAY[]::text[], 'flex_anonymous', ARRAY[]::text[], 'flex_anonymous cannot run the maintenance');

-- the application works as flex_internal_auth
SET LOCAL ROLE flex_internal_auth;
SELECT lives_ok(
    $$INSERT INTO auth.session (id, entity_id, expires_at)
      VALUES ('00000000-0000-0000-0000-000000000002', 1, now() + interval '1 hour');
      INSERT INTO auth.token (token_hash, session_id, expires_at)
      VALUES (sha256('x'), '00000000-0000-0000-0000-000000000002', now() + interval '1 hour');
      DELETE FROM auth.session WHERE id = '00000000-0000-0000-0000-000000000002'$$,
    'flex_internal_auth can create and delete sessions and tokens'
);

SELECT finish();
ROLLBACK;
