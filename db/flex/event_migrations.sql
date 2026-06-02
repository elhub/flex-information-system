--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-processed-index runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'flex' AND tablename = 'event' AND indexname = 'event_processed_false_idx'
CREATE INDEX event_processed_false_idx
ON flex.event (processed, id)
WHERE processed = false;
