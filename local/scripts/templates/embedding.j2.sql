--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
{% for embed in embeds %}
-- changeset flex:{{ embed.child }}-{{ embed.child_field }}-to-{{ embed.parent }} runAlways:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.{{ embed.embedding_name }}(
    api.{{ embed.child }}
)
RETURNS SETOF api.{{ embed.parent }}{% if embed.cardinality == 'one' %} ROWS 1{% endif %} AS $$
  select * from api.{{ embed.parent }} where {{ embed.parent_field }} = $1.{{ embed.child_field }}
$$ STABLE LANGUAGE sql;
{% endfor %}
