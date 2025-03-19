SET client_min_messages TO notice;
SET search_path TO gs1, public;

BEGIN;
SELECT plan(20);

SELECT is(compute_check_digit('70900000000000001'), 9);
SELECT is(compute_check_digit('70900000000000002'), 6);
SELECT is(compute_check_digit('70900000000000003'), 3);
SELECT is(compute_check_digit('70900000000000004'), 0);
SELECT is(compute_check_digit('70900000000000005'), 7);
SELECT is(compute_check_digit('70900000000000006'), 4);
SELECT is(compute_check_digit('70900000000000007'), 1);
SELECT is(compute_check_digit('70900000000000008'), 8);
SELECT is(compute_check_digit('70900000000000009'), 5);
SELECT is(compute_check_digit('70900000000000010'), 1);
SELECT is(compute_check_digit('70900000000000011'), 8);
SELECT is(compute_check_digit('70900000000000012'), 5);
SELECT is(compute_check_digit('70900000000000013'), 2);
SELECT is(compute_check_digit('70900000000000014'), 9);
SELECT is(compute_check_digit('70900000000000015'), 6);
SELECT is(compute_check_digit('70900000000000016'), 3);
SELECT is(compute_check_digit('70900000000000017'), 0);
SELECT is(compute_check_digit('70900000000000018'), 7);
SELECT is(compute_check_digit('70900000000000019'), 4);
SELECT is(compute_check_digit('70900000000000020'), 0);

SELECT finish();

ROLLBACK;
