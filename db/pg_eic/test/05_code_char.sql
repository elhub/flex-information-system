SET client_min_messages TO notice;
SET search_path TO eic, public;

BEGIN;
SELECT plan(16);

SELECT is(code_to_char(0), '0');
SELECT is(code_to_char(7), '7');
SELECT is(code_to_char(9), '9');
SELECT is(code_to_char(10), 'A');
SELECT is(code_to_char(17), 'H');
SELECT is(code_to_char(21), 'L');
SELECT is(code_to_char(35), 'Z');
SELECT is(code_to_char(36), '-');

SELECT is(char_to_code('0'), 0);
SELECT is(char_to_code('4'), 4);
SELECT is(char_to_code('9'), 9);
SELECT is(char_to_code('A'), 10);
SELECT is(char_to_code('E'), 14);
SELECT is(char_to_code('Q'), 26);
SELECT is(char_to_code('Z'), 35);
SELECT is(char_to_code('-'), 36);

SELECT finish();

ROLLBACK;
