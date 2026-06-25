--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-comment-constraint-typo runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'service_provider_product_suspension_comment_sppa_fkey'
ALTER TABLE flex.service_provider_product_suspension_comment
RENAME CONSTRAINT
service_provider_product_suspension_comment_sppa_fkey
TO
service_provider_product_suspension_comment_spps_fkey;

-- changeset flex:service-provider-product-suspension-comment-add-same-party-type-visibility runOnChange:false endDelimiter:;
ALTER TABLE flex.service_provider_product_suspension_comment
DROP CONSTRAINT IF EXISTS
service_provider_product_suspension_comment_visibility_check;

ALTER TABLE flex.service_provider_product_suspension_comment
ADD CONSTRAINT
service_provider_product_suspension_comment_visibility_check
CHECK (
    visibility IN (
        'same_party',
        'same_party_type',
        'any_involved_party'
    )
);
