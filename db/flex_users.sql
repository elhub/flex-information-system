SET role TO flex;
SET search_path TO flex, public;

-- Set system identity
SET "flex.current_identity" TO 0;
SET "flex.current_party" TO 0;
SET "flex.current_entity" TO 0;

-- noqa: disable=all
SELECT add_test_account('13370000000', 'common.shared@flex.test', '13370000000000', '13370000', true, false, 'N/A');
SELECT add_test_account('13370000001', 'test.suite@flex.test', '13370000000001', '13370001', true, true, 'Common');
