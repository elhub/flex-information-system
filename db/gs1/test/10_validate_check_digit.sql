SET client_min_messages TO notice;

BEGIN;
SELECT plan(4);

SELECT ok(NOT validate_check_digit('9312345678906'));
SELECT ok(validate_check_digit('9312345678907'));
SELECT ok(NOT validate_check_digit('9312345678908'));
SELECT ok(NOT validate_check_digit('9312345678900'));

SELECT finish();

ROLLBACK;
