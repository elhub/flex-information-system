--liquibase formatted sql
-- Manually managed file

-- changeset flex:notification-mark-events-as-processed runOnChange:false endDelimiter:; stripComments:true
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM flex.event WHERE processed = true
UPDATE flex.event
SET processed = true
WHERE id < (
    -- the - 42 is because ids are not necessarily sequential when there are parallel inserts
    SELECT COALESCE(MAX(event_id), 0) - 42
    FROM flex.notification
);
