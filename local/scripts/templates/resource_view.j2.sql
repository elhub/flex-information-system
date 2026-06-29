--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
-- noqa: disable=RF04,ST06
-- RF04 - Keywords should not be used as identifiers.
-- ST06 - Select wildcards then simple targets before calculations and aggregates.

{%- set all_fields = data.properties.keys() %}
{%- set fields = all_fields | reject("in", ["id", "valid_to", "valid_from"]) | list %}
{%- set has_valid_time = "valid_from" in all_fields %}
{%- set has_record_time = data.get('audit') %}
{%- set schema = data.get('module') %}

-- changeset flex:{{ schema }}-{{ resource | replace("_", "-") }}-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
{{ schema }}.{{ resource }}
WITH (security_invoker = true) AS (
    SELECT
        id,
{%- if has_record_time %}
        recorded_by,
        lower(record_time_range) AS recorded_at,{% endif %}{% if has_valid_time %}
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
{%- endif %}{% for field in fields %}
        {{ data.properties[field]["x-sql"] + " AS " if "x-sql" in data.properties[field] }}{{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}
    FROM flex.{{ resource }}
);

{%- if data.get('history') %}
-- changeset flex:{{ schema }}-{{ resource | replace("_", "-") }}-history-create endDelimiter:-- runOnChange:true
CREATE OR REPLACE VIEW
{{ schema }}.{{ resource }}_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS {{ resource }}_id,
{%- if has_record_time %}
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at,{% endif %}{% if has_valid_time %}
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
{%- endif %}{% for field in fields %}
        {{ data.properties[field]["x-sql"] + " AS " if "x-sql" in data.properties[field] }}{{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}
    FROM flex.{{ resource }}
    UNION ALL
    SELECT
        history_id AS id,
        id AS {{ resource }}_id,
{%- if has_record_time %}
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at,{% endif %}{% if has_valid_time %}
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to,
{%- endif %}{% for field in fields %}
        {{ data.properties[field]["x-sql"] + " AS " if "x-sql" in data.properties[field] }}{{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}
    FROM flex.{{ resource }}_history
);

{%- endif %}
