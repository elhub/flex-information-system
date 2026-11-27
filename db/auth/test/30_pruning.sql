-- noqa: disable=all

BEGIN;
SELECT plan(4);

-- the text of the plan of a query
CREATE FUNCTION pg_temp.plan_of(query text) RETURNS text
LANGUAGE plpgsql AS $$
DECLARE
    line text;
    result text := '';
BEGIN
    FOR line IN EXECUTE 'EXPLAIN (COSTS OFF) ' || query LOOP
        result := result || line || E'\n';
    END LOOP;
    RETURN result;
END;
$$;

SELECT matches(
    pg_temp.plan_of($$
        SELECT session_id, expires_at, used_at FROM auth.token
        WHERE token_hash = sha256('x')
            AND expires_at > now()
            AND expires_at <= now() + interval '12 hours'
    $$),
    'Subplans Removed: [0-9]+',
    'the lookup prunes partitions'
);

SELECT matches(
    pg_temp.plan_of($$SELECT session_id FROM auth.token WHERE token_hash = sha256('x')$$),
    'token_p[0-9]{8}.*token_p[0-9]{8}.*token_p[0-9]{8}',
    'without a time filter all partitions are scanned'
);
SELECT doesnt_match(
    pg_temp.plan_of($$SELECT session_id FROM auth.token WHERE token_hash = sha256('x')$$),
    'Subplans Removed',
    'without a time filter nothing is pruned'
);

-- the atomic refresh
SELECT matches(
    pg_temp.plan_of($$
        UPDATE auth.token SET used_at = now()
        WHERE token_hash = sha256('x') AND used_at IS NULL
            AND expires_at > now() AND expires_at <= now() + interval '12 hours'
        RETURNING session_id, expires_at
    $$),
    'Subplans Removed: [0-9]+',
    'the atomic refresh prunes partitions'
);

SELECT finish();
ROLLBACK;
