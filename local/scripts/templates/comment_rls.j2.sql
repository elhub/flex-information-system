--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

{%- set liquibase_resource = resource | replace("_", "-") %}
{%- set lower_acronym = data.acronym | lower %}

-- changeset flex:{{ liquibase_resource }}-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS
{{ resource }}_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT
ON {{ resource }}_comment
TO flex_internal_event_notification;
CREATE POLICY "{{ data.acronym }}C_INTERNAL_EVENT_NOTIFICATION"
ON {{ resource }}_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT
ON {{ resource }}_comment_history
TO flex_internal_event_notification;
CREATE POLICY "{{ data.acronym }}CH_INTERNAL_EVENT_NOTIFICATION"
ON {{ resource }}_comment_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON {{ resource }}_comment
TO flex_common;

-- RLS: {{ data.acronym }}C-COM001
CREATE POLICY "{{ data.acronym }}C_COM001"
ON {{ resource }}_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: {{ data.acronym }}C-SO001
-- RLS: {{ data.acronym }}C-SP001
CREATE POLICY "{{ data.acronym }}C_SO001_SP001"
ON {{ resource }}_comment
FOR INSERT
TO flex_system_operator, flex_service_provider
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM flex.{{ resource }}_involved_parties AS {{ lower_acronym }}_ip -- noqa
        WHERE {{ lower_acronym }}_ip.{{ resource }}_id = {{ resource }}_comment.{{ resource }}_id -- noqa
            AND {{ lower_acronym }}_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: {{ data.acronym }}C-SO002
-- RLS: {{ data.acronym }}C-SP002
CREATE POLICY "{{ data.acronym }}C_SO002_SP002_same_party"
ON {{ resource }}_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    {{ resource }}_comment.visibility = 'same_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE
            comment_creator.id = {{ resource }}_comment.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
    )
);

CREATE POLICY "{{ data.acronym }}C_SO002_SP002_any_involved_party"
ON {{ resource }}_comment
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    {{ resource }}_comment.visibility = 'any_involved_party' -- noqa
    AND EXISTS (
        SELECT 1
        FROM flex.{{ resource }}_involved_parties AS {{ lower_acronym }}_ip -- noqa
        WHERE {{ lower_acronym }}_ip.{{ resource }}_id = {{ resource }}_comment.{{ resource }}_id -- noqa
            AND {{ lower_acronym }}_ip.party_id = (SELECT flex.current_party())
    )
);

CREATE OR REPLACE FUNCTION
{{ lower_acronym }}_comment_latest_visibility(in_{{ lower_acronym }}c_id bigint)
RETURNS text
SECURITY DEFINER
LANGUAGE sql
STABLE
AS $$
    WITH
        {{ lower_acronym }}_history AS (
            SELECT
                {{ lower_acronym }}c.visibility,
                {{ lower_acronym }}c.record_time_range
            FROM flex.{{ resource }}_comment AS {{ lower_acronym }}c -- noqa
            WHERE {{ lower_acronym }}c.id = in_{{ lower_acronym }}c_id
            UNION ALL
            SELECT
                {{ lower_acronym }}ch.visibility,
                {{ lower_acronym }}ch.record_time_range
            FROM flex.{{ resource }}_comment_history AS {{ lower_acronym }}ch -- noqa
            WHERE {{ lower_acronym }}ch.id = in_{{ lower_acronym }}c_id
        )

    SELECT {{ lower_acronym }}_history.visibility
    FROM {{ lower_acronym }}_history
    ORDER BY {{ lower_acronym }}_history.record_time_range DESC
    LIMIT 1
$$;

-- RLS: {{ data.acronym }}C-SO003
-- RLS: {{ data.acronym }}C-SP003
GRANT SELECT
ON {{ resource }}_comment_history
TO flex_system_operator, flex_service_provider;
CREATE POLICY "{{ data.acronym }}C_SO003_SP003_same_party"
ON {{ resource }}_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    {{ lower_acronym }}_comment_latest_visibility(
        {{ resource }}_comment_history.id -- noqa
    ) = 'same_party'
    AND EXISTS (
        SELECT 1
        FROM flex.identity AS comment_creator
        WHERE
            comment_creator.id = {{ resource }}_comment_history.created_by -- noqa
            AND comment_creator.party_id = (SELECT flex.current_party())
    )
);

CREATE POLICY "{{ data.acronym }}C_SO003_SP003_any_involved_party"
ON {{ resource }}_comment_history
FOR SELECT
TO flex_system_operator, flex_service_provider
USING (
    {{ lower_acronym }}_comment_latest_visibility(
        {{ resource }}_comment_history.id -- noqa
    ) = 'any_involved_party'
    AND EXISTS (
        SELECT 1
        FROM flex.{{ resource }}_involved_parties AS {{ lower_acronym }}_ip -- noqa
        WHERE {{ lower_acronym }}_ip.{{ resource }}_id = {{ resource }}_comment_history.{{ resource }}_id -- noqa
            AND {{ lower_acronym }}_ip.party_id = (SELECT flex.current_party())
    )
);

-- RLS: {{ data.acronym }}C-FISO001
CREATE POLICY "{{ data.acronym }}C_FISO001"
ON {{ resource }}_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: {{ data.acronym }}C-FISO002
CREATE POLICY "{{ data.acronym }}C_FISO002"
ON {{ resource }}_comment_history
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
