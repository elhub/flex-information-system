--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-processed-index runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'flex' AND tablename = 'event' AND indexname = 'event_processed_false_idx'
CREATE INDEX event_processed_false_idx
ON flex.event (processed, id)
WHERE processed = false;

-- changeset flex:event-lookup-source-accounting-point runOnChange:false endDelimiter:;
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:true SELECT EXISTS (SELECT 1 FROM flex.event WHERE type = 'no.elhub.flex.controllable_unit.lookup' AND source_resource = 'controllable_unit')
WITH
    lookup_event_data AS (
        SELECT
            e.id AS event_id,
            cu.accounting_point_id AS ap_id,
            cu.id AS cu_id
        FROM flex.event AS e
            INNER JOIN flex.controllable_unit AS cu
                ON e.source_id = cu.id
        WHERE
            e.type = 'no.elhub.flex.controllable_unit.lookup'
            AND e.source_resource = 'controllable_unit'
    )

UPDATE flex.event AS e
SET
    -- transform past lookup events with the old format into CU-specific lookups
    source_resource = 'accounting_point',
    source_id = lookup_event_data.ap_id,
    subject_resource = 'controllable_unit',
    subject_id = lookup_event_data.cu_id
FROM lookup_event_data
WHERE e.id = lookup_event_data.event_id;
