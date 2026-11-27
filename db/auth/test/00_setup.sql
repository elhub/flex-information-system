-- noqa: disable=all

-- run these tests with: ./db/test/test.sh auth

SET client_min_messages TO warning;
CREATE EXTENSION IF NOT EXISTS pgtap;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- stubs: things referenced by the files under test

CREATE SCHEMA IF NOT EXISTS flex;
CREATE SCHEMA IF NOT EXISTS auth;

DO $$ BEGIN
    CREATE ROLE flex_anonymous WITH NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE ROLE flex_internal WITH NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE ROLE flex_internal_auth WITH NOLOGIN IN ROLE flex_internal;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- as in db/auth/changelog.yml
GRANT USAGE ON SCHEMA auth TO flex_anonymous, flex_internal;

CREATE TABLE IF NOT EXISTS flex.entity (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY
);

-- pg_cron is not preloaded in the test container
CREATE SCHEMA IF NOT EXISTS cron;
CREATE OR REPLACE FUNCTION cron.schedule(text, text, text)
RETURNS bigint LANGUAGE sql AS $$ SELECT 1::bigint $$;

-- two entities to log in with
INSERT INTO flex.entity DEFAULT VALUES;
INSERT INTO flex.entity DEFAULT VALUES;

-- lets verify that pgtap works
BEGIN;
SELECT plan(1);
SELECT ok(now() = now(), 'now() = now() should return true');
SELECT finish();
ROLLBACK;

-- load the real database files
\i /db/auth/session.sql
