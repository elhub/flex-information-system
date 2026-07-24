--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT (scripts/openapi_to_db.py)
{% for rel in rels %}
-- changeset flex:{{ rel.child.resource }}-{{ rel.child.name }}-to-{{ rel.parent.resource }} runOnChange:true endDelimiter:--
CREATE OR REPLACE FUNCTION api.{{ rel.name }}(
    api.{{ rel.child.resource }}
)
RETURNS SETOF api.{{ rel.parent.resource }}{% if rel.cardinality == 'one' %} ROWS 1{% endif %} AS $$
  select * from api.{{ rel.parent.resource }} where {{ rel.parent.name }} = $1.{{ rel.child.name }}
$$ STABLE LANGUAGE sql;

-- changeset flex:{{ rel.child.resource }}-{{ rel.child.name }}-to-{{ rel.parent.resource }}-grant runOnChange:true endDelimiter:--
GRANT EXECUTE ON FUNCTION
api.{{ rel.name }}(api.{{ rel.child.resource }})
TO flex_common, flex_entity;
{% endfor -%}
