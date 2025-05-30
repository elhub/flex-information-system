--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-drop-system-operator runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:2 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'accounting_point' AND column_name like '%system_operator%';
-- ALTER TABLE flex.accounting_point
-- DISABLE TRIGGER USER;

ALTER TABLE flex.accounting_point
DROP COLUMN system_operator_party_type CASCADE;

ALTER TABLE flex.accounting_point
DROP COLUMN system_operator_id CASCADE;

-- ALTER TABLE flex.accounting_point
-- ENABLE TRIGGER USER;

ALTER TABLE flex.accounting_point_history
DROP COLUMN system_operator_party_type;

ALTER TABLE flex.accounting_point_history
DROP COLUMN system_operator_id;
