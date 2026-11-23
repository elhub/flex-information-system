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
-- ltree operators are not leakproof, text equality is. Everything that depends
-- on event.type has to be dropped and recreated, because Postgres does not
-- allow changing the type of a column used by views, functions or policies.
-- The runOnChange changesets that define these objects would not re-run
-- as their content is unchanged, so they are recreated here.
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

CREATE POLICY "EVENT_EU001_LOOKUP" ON flex.event
FOR SELECT
TO flex_end_user
USING (
    source_resource = 'accounting_point'
    AND type = 'no.elhub.flex.controllable_unit.lookup'
    AND EXISTS (
        SELECT 1
        FROM (
            SELECT
                id AS cu_id,
                accounting_point_id,
                record_time_range
            FROM flex.controllable_unit
            UNION ALL
            SELECT
                id AS cu_id,
                accounting_point_id,
                record_time_range
            FROM flex.controllable_unit_history
        ) AS cu_timeline
            INNER JOIN flex.controllable_unit_end_user AS cueu
                ON cu_timeline.cu_id = cueu.controllable_unit_id
        WHERE cu_timeline.accounting_point_id = event.source_id
            AND cu_timeline.record_time_range @> lower(event.record_time_range)
            AND cueu.end_user_id = (SELECT flex.current_party())
            AND cueu.valid_time_range @> lower(event.record_time_range)
    )
);

CREATE POLICY "EVENT_COM001" ON flex.event
FOR SELECT
TO flex_common
USING (
    type <> 'no.elhub.flex.controllable_unit.lookup'
    AND CASE
        WHEN subject_resource IS NOT null
            THEN flex.event_resource_visible_check(
                    subject_resource,
                    subject_id,
                    lower(record_time_range)
                )
        ELSE
            flex.event_resource_visible_check(
                source_resource,
                source_id,
                lower(record_time_range)
            )
    END
);

CREATE VIEW api.event
WITH (security_invoker = true) AS (
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source, -- noqa
        CASE
            WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time -- noqa
    FROM flex.event
);

GRANT SELECT (id, specversion, time, type, source, subject, data)
ON TABLE api.event
TO flex_balance_responsible_party,
flex_energy_supplier,
flex_end_user,
flex_flexibility_information_system_operator,
flex_market_operator,
flex_system_operator,
flex_service_provider,
flex_third_party;

GRANT SELECT ON TABLE api.event TO flex_internal_event_notification;
GRANT SELECT ON TABLE api.event TO flex_operation_readonly;

CREATE VIEW notification.event
WITH (security_invoker = true) AS (
    SELECT
        id,
        type,
        source_resource,
        source_id,
        data,
        record_time_range,
        recorded_by,
        subject_resource,
        subject_id,
        processed,
        lower(record_time_range) AS recorded_at
    FROM flex.event
);

GRANT SELECT ON TABLE notification.event TO flex_internal_event_notification;
GRANT UPDATE (processed) ON notification.event TO flex_internal_event_notification;

CREATE FUNCTION api.event_source(
    source_resource text,
    source_id bigint
)
RETURNS SETOF api.event
SECURITY INVOKER
STABLE
LANGUAGE sql
AS $$
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source,
        CASE
            WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time
    FROM flex.event e
    WHERE e.source_resource IS NOT DISTINCT FROM event_source.source_resource
      AND e.source_id IS NOT DISTINCT FROM event_source.source_id;
$$;

GRANT EXECUTE ON FUNCTION api.event_source(text, bigint) TO flex_common;

CREATE FUNCTION api.event_subject(
    subject_resource text,
    subject_id bigint
)
RETURNS SETOF api.event
SECURITY INVOKER
STABLE
LANGUAGE sql
AS $$
    SELECT
        id,
        '1.0' AS specversion,
        type,
        data,
        '/' || source_resource || '/' || source_id AS source,
        CASE
            WHEN subject_resource IS null THEN null
            ELSE '/' || subject_resource || '/' || subject_id
        END AS subject,
        lower(record_time_range) AS time
    FROM flex.event e
    WHERE e.subject_resource IS NOT DISTINCT FROM event_subject.subject_resource
      AND e.subject_id IS NOT DISTINCT FROM event_subject.subject_id;
$$;

GRANT EXECUTE ON FUNCTION api.event_subject(text, bigint) TO flex_common;

CREATE FUNCTION api.event(api.notification)
RETURNS SETOF api.event ROWS 1 AS $$
  select *
  from api.event
  where id = $1.event_id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION api.event(api.notification)
TO flex_common, flex_entity;

CREATE FUNCTION api.notification(api.event)
RETURNS SETOF api.notification AS $$
  select *
  from api.notification
  where event_id = $1.id
$$ STABLE LANGUAGE sql;

GRANT EXECUTE ON FUNCTION api.notification(api.event)
TO flex_common, flex_entity;
