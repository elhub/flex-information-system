-- liquibase formatted sql
-- noqa: disable=all

-- changeset flex:test-users runOnChange:true endDelimiter:;
SELECT test_data.add_test_account(0, 'Common Shared', true, false, 'N/A');
SELECT test_data.add_test_account(1, 'Test Suite', true, true, 'Common');
