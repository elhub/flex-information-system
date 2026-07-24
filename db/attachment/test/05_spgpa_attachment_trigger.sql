-- noqa: disable=all

SET client_min_messages TO warning;
CREATE EXTENSION IF NOT EXISTS pgtap;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- stubs: things referenced in grants / default column values / etc

CREATE SCHEMA IF NOT EXISTS flex;
CREATE SCHEMA IF NOT EXISTS attachment;

SET search_path TO flex, public;

DO $$ BEGIN
    CREATE ROLE flex_common WITH NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION flex.current_identity()
RETURNS bigint LANGUAGE sql STABLE AS $$
    SELECT 1::bigint;
$$;

CREATE OR REPLACE FUNCTION flex.current_party()
RETURNS bigint LANGUAGE sql STABLE AS $$
    SELECT 1::bigint;
$$;

CREATE OR REPLACE FUNCTION flex.capture_event()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RETURN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS flex.service_providing_group_product_application (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY
);

CREATE TABLE IF NOT EXISTS
flex.service_providing_group_product_application_involved_parties (
    service_providing_group_product_application_id bigint NOT NULL,
    party_id bigint NOT NULL
);

-- load real database files
\i /db/flex/attachment.sql
\i /db/flex/service_providing_group_product_application_attachment.sql
\i /db/attachment/service_providing_group_product_application_attachment.sql

-- one SPGPA to reference throughout the tests
INSERT INTO flex.service_providing_group_product_application DEFAULT VALUES;

BEGIN;
SELECT plan(13);

-- insert

INSERT INTO attachment.service_providing_group_product_application_attachment (
    service_providing_group_product_application_id,
    object_id,
    filename,
    filename_sanitised,
    content_type,
    size_bytes
) VALUES (
    1,
    '11111111-1111-1111-1111-111111111111',
    'report.pdf',
    'report.pdf',
    'application/pdf',
    1024
);

SELECT is(
    (SELECT count(*)::int FROM flex.attachment),
    1,
    'INSERT through view creates one row in flex.attachment'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM flex.service_providing_group_product_application_attachment
    ),
    1,
    'INSERT through view creates one row in the link table'
);

SELECT is(
    (SELECT filename FROM flex.attachment LIMIT 1),
    'report.pdf',
    'flex.attachment.filename matches the inserted value'
);

SELECT is(
    (SELECT content_type FROM flex.attachment LIMIT 1),
    'application/pdf',
    'flex.attachment.content_type matches the inserted value'
);

SELECT is(
    (SELECT size_bytes FROM flex.attachment LIMIT 1),
    1024::bigint,
    'flex.attachment.size_bytes matches the inserted value'
);

SELECT is(
    (
        SELECT service_providing_group_product_application_id
        FROM flex.service_providing_group_product_application_attachment
        LIMIT 1
    ),
    1::bigint,
    'link row references the correct SPGPA id'
);

SELECT is(
    (
        SELECT spgpaa.attachment_id
        FROM flex.service_providing_group_product_application_attachment AS spgpaa
            INNER JOIN flex.attachment AS att ON spgpaa.attachment_id = att.id
        LIMIT 1
    ),
    (SELECT id FROM flex.attachment LIMIT 1),
    'link row attachment_id references the created flex.attachment row'
);

-- read

SELECT is(
    (
        SELECT count(*)::int
        FROM attachment.service_providing_group_product_application_attachment
    ),
    1,
    'SELECT through the view returns one row after insert'
);

SELECT is(
    (
        SELECT filename
        FROM attachment.service_providing_group_product_application_attachment
    ),
    'report.pdf',
    'view row filename matches the inserted value'
);

SELECT is(
    (
        SELECT object_id
        FROM attachment.service_providing_group_product_application_attachment
    ),
    '11111111-1111-1111-1111-111111111111'::uuid,
    'view row object_id matches the inserted value'
);

-- delete

DELETE FROM attachment.service_providing_group_product_application_attachment
WHERE service_providing_group_product_application_id = 1;

SELECT is(
    (
        SELECT count(*)::int
        FROM attachment.service_providing_group_product_application_attachment
    ),
    0,
    'DELETE through view leaves no rows visible in the view'
);

SELECT is(
    (SELECT count(*)::int FROM flex.attachment),
    0,
    'DELETE through view removes the flex.attachment row'
);

SELECT is(
    (
        SELECT count(*)::int
        FROM flex.service_providing_group_product_application_attachment
    ),
    0,
    'DELETE through view removes the link row'
);

SELECT finish();
ROLLBACK;
