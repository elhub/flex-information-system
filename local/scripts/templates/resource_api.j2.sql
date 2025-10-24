--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)

{%- set all_fields = data.properties.keys() | sort %}
{%- set fields = all_fields | reject("in", ["id", "valid_to", "valid_from"]) | list %}
{%- set has_valid_time = "valid_from" in all_fields %}
{%- set has_record_time = data.get('audit') %}

-- changeset flex:api-{{ resource | replace("_", "-") }}-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.{{ resource }}
WITH (security_invoker = true) AS (
    SELECT
        id,
{%- for field in fields %}
        {{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}{% if has_record_time %},
        recorded_by,
        lower(record_time_range) AS recorded_at{% endif %}{% if has_valid_time %},
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
{%- endif %}
    FROM flex.{{ resource }}
);

{%- if data.get('history') %}
-- changeset flex:api-{{ resource | replace("_", "-") }}-history-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW
api.{{ resource }}_history
WITH (
    security_invoker = true
) AS (
    SELECT
        id,
        id AS {{ resource }}_id,
{%- for field in fields %}
        {{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}{% if has_record_time %},
        recorded_by,
        lower(record_time_range) AS recorded_at,
        null AS replaced_by,
        null AS replaced_at{% endif %}{% if has_valid_time %},
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
{%- endif %}
    FROM flex.{{ resource }}
    UNION ALL
    SELECT
        history_id AS id,
        id AS {{ resource }}_id,
{%- for field in fields %}
        {{ field }}{{ "," if not loop.last else "" }}
{%- endfor %}{% if has_record_time %},
        recorded_by,
        lower(record_time_range) AS recorded_at,
        replaced_by,
        upper(record_time_range) AS replaced_at{% endif %}{% if has_valid_time %},
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
{%- endif %}
    FROM flex.{{ resource }}_history
);

{%- endif %}
