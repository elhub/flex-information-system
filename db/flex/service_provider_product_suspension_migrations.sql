--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-reason-update runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'service_provider_product_suspension_reason_check' AND conbin::text LIKE '%102 97 105 108 101 100 95 118 101 114 105 102 105 99 97 116 105 111 110%'
-- (NB: searching for the ASCII codes for "failed_verification")
ALTER TABLE flex.service_provider_product_suspension
DISABLE TRIGGER USER;

ALTER TABLE flex.service_provider_product_suspension
DROP CONSTRAINT IF EXISTS service_provider_product_suspension_reason_check;

UPDATE flex.service_provider_product_suspension
SET reason = 'breach_of_conditions'
WHERE reason = 'failed_verification';

UPDATE flex.service_provider_product_suspension_history
SET reason = 'breach_of_conditions'
WHERE reason = 'failed_verification';

ALTER TABLE flex.service_provider_product_suspension
ADD CONSTRAINT service_provider_product_suspension_reason_check CHECK (
    reason IN (
        'communication_issues',
        'failing_heartbeat',
        'system_issues',
        'clearing_issues',
        'breach_of_conditions',
        'other'
    )
);

ALTER TABLE flex.service_provider_product_suspension
ENABLE TRIGGER USER;
