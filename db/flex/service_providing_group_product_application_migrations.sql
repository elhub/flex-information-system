--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-rename-prequalified-verified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:2 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name IN ('last_prequalified', 'last_verified')
ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_prequalified TO prequalified_at;

ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_verified TO verified_at;
