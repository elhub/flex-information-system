--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-comment-visibility-update runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'service_provider_product_suspension_comment_visibility_check' AND conbin::text LIKE '%115 97 109 101 95 112 97 114 116 121 95 116 121 112 101%'
-- (NB: searching for the ASCII codes for "same_party_type")
ALTER TABLE flex.service_provider_product_suspension_comment
DISABLE TRIGGER USER;

ALTER TABLE flex.service_provider_product_suspension_comment
DROP CONSTRAINT IF EXISTS
service_provider_product_suspension_comment_visibility_check;

-- here we make sure restriction levels always increase by default
-- users can always update this later

UPDATE flex.service_provider_product_suspension_comment
SET visibility = 'any_involved_party'
WHERE visibility = 'any_party';

UPDATE flex.service_provider_product_suspension_comment
SET visibility = 'same_party'
WHERE visibility = 'same_party_type';

ALTER TABLE flex.service_provider_product_suspension_comment
ADD CONSTRAINT
service_provider_product_suspension_comment_visibility_check
CHECK (
    visibility IN (
        'same_party',
        'any_involved_party'
    )
);

ALTER TABLE flex.service_provider_product_suspension_comment
ENABLE TRIGGER USER;

UPDATE flex.service_provider_product_suspension_comment_history
SET visibility = 'any_involved_party'
WHERE visibility = 'any_party';

UPDATE flex.service_provider_product_suspension_comment_history
SET visibility = 'same_party'
WHERE visibility = 'same_party_type';

-- changeset flex:service-provider-product-suspension-comment-constraint-typo runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'service_provider_product_suspension_comment_sppa_fkey'
ALTER TABLE flex.service_provider_product_suspension_comment
RENAME CONSTRAINT
service_provider_product_suspension_comment_sppa_fkey
TO
service_provider_product_suspension_comment_spps_fkey;
