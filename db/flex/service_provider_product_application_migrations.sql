--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-rename-qualified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_provider_product_application' AND column_name = 'last_qualified'
ALTER TABLE flex.service_provider_product_application
RENAME COLUMN last_qualified TO qualified_at;
