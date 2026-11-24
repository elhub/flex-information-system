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
--precondition-sql-check expectedResult:t SELECT EXISTS (SELECT 1 FROM flex.event WHERE type = 'no.elhub.flex.controllable_unit.lookup' AND source_resource = 'controllable_unit')
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

-- changeset flex:event-type-ltree-to-text runOnChange:false endDelimiter:--
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:ltree SELECT udt_name FROM information_schema.columns WHERE table_schema = 'flex' AND table_name = 'event' AND column_name = 'type'
-- ltree is not leakproof, text is. Postgres cannot alter a column used by views,
-- functions or policies, so these are dropped here. Their changesets are
-- temporarily runAlways (FLEX-1628), so they are recreated in the same deploy.
SET LOCAL lock_timeout = '5s';

DROP POLICY IF EXISTS "EVENT_EU001_LOOKUP" ON flex.event;
DROP POLICY IF EXISTS "EVENT_COM001" ON flex.event;

DROP FUNCTION IF EXISTS api.event(api.notification);
DROP FUNCTION IF EXISTS api.notification(api.event);
DROP FUNCTION IF EXISTS api.event_source(text, bigint);
DROP FUNCTION IF EXISTS api.event_subject(text, bigint);
DROP VIEW IF EXISTS api.event;
DROP VIEW IF EXISTS notification.event;

ALTER TABLE flex.event DROP CONSTRAINT IF EXISTS event_type_check;

ALTER TABLE flex.event ALTER COLUMN type TYPE text USING type::text;

ALTER TABLE flex.event ADD CONSTRAINT event_type_check CHECK (
    type LIKE 'no.elhub.flex.%'
);
