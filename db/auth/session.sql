--liquibase formatted sql

-- changeset flex:auth-session-table runOnChange:false endDelimiter:--
-- created at login, deleted at logout or on reuse or after expiration
-- deleting a session deletes its tokens
CREATE UNLOGGED TABLE IF NOT EXISTS auth.session (
    id uuid PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    entity_id bigint NOT NULL REFERENCES flex.entity (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
);

-- changeset flex:auth-token-table runOnChange:false endDelimiter:--
-- created at login or on refresh, cleared partition by partition or on logout
CREATE UNLOGGED TABLE IF NOT EXISTS auth.token (
    token_hash bytea NOT NULL,
    session_id uuid NOT NULL REFERENCES auth.session (id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL,
    used_at timestamptz NULL,

    PRIMARY KEY (token_hash, expires_at),
    CONSTRAINT check_token_hash_length CHECK (length(token_hash) = 32)
) PARTITION BY RANGE (expires_at);

-- changeset flex:auth-token-session-id-index runOnChange:false endDelimiter:--
CREATE INDEX IF NOT EXISTS token_session_id_idx ON auth.token (session_id);

-- changeset flex:auth-token-default-partition runOnChange:false endDelimiter:--
-- safety net, should always be empty
CREATE UNLOGGED TABLE IF NOT EXISTS auth.token_default
PARTITION OF auth.token DEFAULT;

-- changeset flex:auth-session-table-grant runOnChange:true endDelimiter:;
REVOKE ALL ON auth.session FROM public;
REVOKE ALL ON auth.token FROM public;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.session TO flex_internal_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.token TO flex_internal_auth;

-- changeset flex:auth-session-maintenance runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION auth.session_maintenance()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    d date;
    partition_name text;
    lower_bound timestamptz;
BEGIN
    -- create daily token partitions for the next 7 days
    FOR d IN
        SELECT generate_series(
            (current_timestamp AT TIME ZONE 'UTC')::date - 1,
            (current_timestamp AT TIME ZONE 'UTC')::date + 7,
            interval '1 day'
        )::date
    LOOP
        partition_name := 'token_p' || to_char(d, 'YYYYMMDD');
        EXECUTE format(
            'CREATE UNLOGGED TABLE IF NOT EXISTS auth.%I '
            'PARTITION OF auth.token '
            'FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            (d::text || ' 00:00:00+00')::timestamptz,
            ((d + 1)::text || ' 00:00:00+00')::timestamptz
        );
    END LOOP;

    -- drops all partitions at least 2 days in the past
    FOR partition_name IN
        SELECT c.relname
        FROM pg_inherits AS i
        INNER JOIN pg_class AS c ON i.inhrelid = c.oid
        WHERE
            i.inhparent = 'auth.token'::regclass
            AND c.relname ~ '^token_p[0-9]{8}$'
    LOOP
        lower_bound := (
            substring(partition_name FROM 8 FOR 8) || ' 00:00:00+00'
        )::timestamptz;
        IF lower_bound + interval '2 days' < current_timestamp THEN
            EXECUTE format('DROP TABLE auth.%I', partition_name);
        END IF;
    END LOOP;

    -- delete old sessions (tokens already dropped right above)
    DELETE FROM auth.session
    WHERE expires_at < current_timestamp - interval '2 days';
END;
$$;

-- changeset flex:auth-session-maintenance-grant runOnChange:true endDelimiter:;
REVOKE EXECUTE ON FUNCTION auth.session_maintenance() FROM public;
GRANT EXECUTE ON FUNCTION auth.session_maintenance() TO flex_internal_auth;

-- changeset flex:auth-session-maintenance-initial runOnChange:true endDelimiter:;
SELECT auth.session_maintenance();

-- changeset flex:auth-session-maintenance-job runOnChange:true endDelimiter:;
SELECT cron.schedule(
    'auth-session-maintenance',
    '16 21 * * *', -- once every day
    $$SELECT auth.session_maintenance()$$
);
