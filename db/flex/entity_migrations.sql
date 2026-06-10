--liquibase formatted sql
-- Manually managed file

-- changeset flex:entity-business-id-constraint runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_catalog.pg_constraint WHERE conname = 'check_entity_type_business_id_type'
ALTER TABLE flex.entity
ADD CONSTRAINT check_entity_type_business_id_type CHECK (
    (type = 'person' AND business_id_type IN ('pid', 'email'))
    OR (type = 'organisation' AND business_id_type = 'org')
);

-- changeset flex:entity-business-id-email-lowercase runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:t SELECT EXISTS (SELECT 1 FROM flex.entity WHERE business_id_type = 'email' AND business_id != lower(business_id))
UPDATE flex.entity
SET business_id = lower(business_id)
WHERE business_id_type = 'email' AND business_id != lower(business_id);
