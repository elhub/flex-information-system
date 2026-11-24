--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
{% for rel in rels %}
-- changeset flex:{{ rel.child.resource }}-{{ rel.child.name }}-to-{{ rel.parent.resource }} runOnChange:true endDelimiter:--{% if rel.child.resource == 'event' or rel.parent.resource == 'event' %} runAlways:true{% endif %}
CREATE OR REPLACE FUNCTION {{ module }}.{{ rel.name }}(
    {{ module }}.{{ rel.child.resource }}
)
RETURNS SETOF {{ module }}.{{ rel.parent.resource }}{% if rel.cardinality == 'one' %} ROWS 1{% endif %} AS $$
  select *
  from {{ module }}.{{ rel.parent.resource }}
  where {{ rel.parent.name }} = $1.{{ rel.child.name }}
$$ STABLE LANGUAGE sql;

-- changeset flex:{{ rel.child.resource }}-{{ rel.child.name }}-to-{{ rel.parent.resource }}-grant runOnChange:true endDelimiter:--{% if rel.child.resource == 'event' or rel.parent.resource == 'event' %} runAlways:true{% endif %}
GRANT EXECUTE ON FUNCTION
{{ module }}.{{ rel.name }}(
    {{ module }}.{{ rel.child.resource }}
)
TO flex_common, flex_entity;
{% endfor -%}
