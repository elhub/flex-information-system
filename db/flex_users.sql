SET search_path TO flex, public;

-- Set system identity
SET "flex.current_identity" TO 0;
SET "flex.current_party" TO 0;
SET "flex.current_entity" TO 0;

-- noqa: disable=all
SELECT test_data.add_test_account(0, 'common.shared@flex.test', true, false, 'N/A');
SELECT test_data.add_test_account(1, 'test.suite@flex.test', true, true, 'Common');
