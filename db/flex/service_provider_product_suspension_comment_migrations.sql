--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-comment-on-delete-cascade runOnChange:false endDelimiter:;
ALTER TABLE flex.service_provider_product_suspension_comment
DROP CONSTRAINT IF EXISTS service_provider_product_suspension_comment_sppa_fkey;

ALTER TABLE flex.service_provider_product_suspension_comment
ADD CONSTRAINT service_provider_product_suspension_comment_sppa_fkey
FOREIGN KEY (service_provider_product_suspension_id)
REFERENCES service_provider_product_suspension (id)
ON DELETE CASCADE;
