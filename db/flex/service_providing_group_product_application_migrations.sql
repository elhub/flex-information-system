--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-rename-prequalified-verified-at runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:2 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'service_providing_group_product_application' AND column_name IN ('last_prequalified', 'last_verified')
ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_prequalified TO prequalified_at;
ALTER TABLE flex.service_providing_group_product_application_history
RENAME COLUMN last_prequalified TO prequalified_at;

ALTER TABLE flex.service_providing_group_product_application
RENAME COLUMN last_verified TO verified_at;
ALTER TABLE flex.service_providing_group_product_application_history
RENAME COLUMN last_verified TO verified_at;

-- changeset flex:service-providing-group-product-application-clean-status-timestamp-triggers runOnChange:true endDelimiter:;
DROP TRIGGER IF EXISTS
service_providing_group_product_application_check_timestamp_on_status_update
ON service_providing_group_product_application;

DROP FUNCTION IF EXISTS
service_providing_group_product_application_status_prequalified;
DROP TRIGGER IF EXISTS
service_providing_group_product_application_status_prequalified
ON service_providing_group_product_application;

DROP FUNCTION IF EXISTS
service_providing_group_product_application_status_verified;
DROP TRIGGER IF EXISTS
service_providing_group_product_application_status_verified
ON service_providing_group_product_application;
