--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-split-source runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'event' AND column_name = 'source_id'
ALTER TABLE flex.event
ADD COLUMN source_resource text;

ALTER TABLE flex.event
ADD COLUMN source_id bigint;

UPDATE flex.event
SET
    source_resource = split_part(source, '/', 2),
    source_id = split_part(source, '/', 3)::bigint;

ALTER TABLE flex.event
DROP COLUMN source CASCADE;

ALTER TABLE flex.event
ALTER COLUMN source_resource SET NOT NULL;

ALTER TABLE flex.event
ALTER COLUMN source_id SET NOT NULL;

-- changeset flex:event-subject-fields runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'event' AND column_name LIKE 'subject%'
ALTER TABLE flex.event
ADD COLUMN subject_resource text;

ALTER TABLE flex.event
ADD COLUMN subject_id bigint;
