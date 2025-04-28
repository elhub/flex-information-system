SET client_min_messages TO notice;
SET search_path TO eic, public;

BEGIN;
SELECT plan(17);

SELECT is(compute_check_char('12X1-2-3-4-5-6-'), 'U');
SELECT is(compute_check_char('13X1-2-3-4-5-6-'), 'F');
SELECT is(compute_check_char('27X1-2-3-4-5-6-'), 'D');
SELECT is(compute_check_char('27X9-8-7-654321'), 'D');
SELECT is(compute_check_char('31XABCDEFGHIJK0'), '4');
SELECT is(compute_check_char('31XLMNOPQRSTUVW'), '8');
SELECT is(compute_check_char('31XXXX---YY---Z'), 'Y');

SELECT ok(validate_check_char('12X1-2-3-4-5-6-U'));
SELECT ok(NOT validate_check_char('12X1-2-3-4-5-6-Z'));
SELECT ok(validate_check_char('13X1-2-3-4-5-6-F'));
SELECT ok(NOT validate_check_char('13X1-2-3-4-5-6-2'));
SELECT ok(validate_check_char('27X1-2-3-4-5-6-D'));
SELECT ok(validate_check_char('27X9-8-7-654321D'));
SELECT ok(validate_check_char('31XABCDEFGHIJK04'));
SELECT ok(validate_check_char('31XLMNOPQRSTUVW8'));
SELECT ok(NOT validate_check_char('31XLMNOPQRSTUVW5'));
SELECT ok(validate_check_char('31XXXX---YY---ZY'));

SELECT finish();

ROLLBACK;
