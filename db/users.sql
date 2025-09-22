-- liquibase formatted sql
-- noqa: disable=all

-- changeset flex:test-users runOnChange:true endDelimiter:;
SELECT test_data.add_test_account(0, 'Common Shared', true, false, 'N/A');
SELECT test_data.add_test_account(1, 'Test Suite', true, true, 'Common');
SELECT test_data.add_test_account(2, 'Emil Post', true, true, 'Common');

-- changeset flex:test-email-user runAlways:true endDelimiter:/ splitStatements:false
SELECT set_config('flex.current_identity', '0', true);

UPDATE flex.entity
SET business_id = 'emil.post@example.com',
    business_id_type = 'email'
WHERE business_id = '13370000002';
/
