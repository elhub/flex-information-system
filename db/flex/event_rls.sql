--liquibase formatted sql
-- Manually managed file

-- changeset flex:event-resource-visible-check-function runOnChange:true endDelimiter:--
-- function to check if a resource was visible at the time of an event
-- used in the general EVENT-COM001 policy
CREATE OR REPLACE FUNCTION event_resource_visible_check(
    in_resource text,
    in_resource_id bigint,
    in_event_time timestamptz
)
RETURNS boolean
SECURITY INVOKER -- calling this as the user trying to read the event
LANGUAGE plpgsql
AS
$$
DECLARE
    l_is_resource_visible_at_event_time boolean;
BEGIN
    EXECUTE format(
        'WITH visible_resource_timeline AS (
            SELECT record_time_range FROM flex.%s WHERE id = $1
            UNION
            SELECT record_time_range FROM flex.%s_history WHERE id = $1
        )
        SELECT EXISTS (
            SELECT 1 FROM visible_resource_timeline
            WHERE tstzrange(
                lower(record_time_range),
                upper(record_time_range),
                ''[]'' -- for delete events, we need to include the upper bound
            ) @> $2
        )',
        in_resource,
        in_resource
    )
    INTO l_is_resource_visible_at_event_time
    USING in_resource_id, in_event_time;

    RETURN l_is_resource_visible_at_event_time;
END;
$$;

-- changeset flex:event-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS event ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON event TO flex_internal_event_notification;
CREATE POLICY "EVENT_INTERNAL_EVENT_NOTIFICATION_SELECT" ON event
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT UPDATE (processed) ON event TO flex_internal_event_notification;
CREATE POLICY "EVENT_INTERNAL_EVENT_NOTIFICATION_UPDATE" ON event
FOR UPDATE
TO flex_internal_event_notification
USING (true)
WITH CHECK (true);

GRANT SELECT ON event TO flex_end_user;

-- RLS: EVENT-EU001
-- RLS: EVENT-EU002
-- RLS: EVENT-EU003
CREATE POLICY "EVENT_EU001_002_003" ON event
FOR SELECT
TO flex_end_user
USING (
    source_resource = 'controllable_unit' AND EXISTS (
        SELECT 1
        FROM flex.controllable_unit_end_user AS cueu
        WHERE cueu.controllable_unit_id = event.source_id -- noqa
            AND cueu.end_user_id = (SELECT flex.current_party())
            AND cueu.valid_time_range @> lower(event.record_time_range) -- noqa
    )
);

-- RLS: EVENT-FISO001
GRANT SELECT ON event TO flex_flexibility_information_system_operator;
CREATE POLICY "EVENT_FISO001" ON event
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: EVENT-COM001
GRANT SELECT ON event TO flex_common;
CREATE POLICY "EVENT_COM001" ON event
FOR SELECT
TO flex_common
USING (
    NOT (type ~ 'no.elhub.flex.controllable_unit.lookup')
    -- when subject is here, it is the most precise identifier of the thing
    -- the event concerns, so we should do the check on it instead of source
    AND CASE
        WHEN subject_resource IS NOT null
            THEN event_resource_visible_check(
                subject_resource,
                subject_id,
                lower(record_time_range)
            )
        ELSE
            event_resource_visible_check(
                source_resource,
                source_id,
                lower(record_time_range)
            )
    END
);
