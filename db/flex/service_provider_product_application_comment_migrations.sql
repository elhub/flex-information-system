--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-comment-drop-party-of-identity runOnChange:false endDelimiter:;
DROP FUNCTION IF EXISTS party_of_identity;

-- changeset flex:service-provider-product-application-comment-add-same-party-type-visibility runOnChange:false endDelimiter:;
ALTER TABLE flex.service_provider_product_application_comment
DROP CONSTRAINT IF EXISTS
service_provider_product_application_comment_visibility_check;

ALTER TABLE flex.service_provider_product_application_comment
ADD CONSTRAINT
service_provider_product_application_comment_visibility_check
CHECK (
    visibility IN (
        'same_party',
        'same_party_type',
        'any_involved_party'
    )
);
