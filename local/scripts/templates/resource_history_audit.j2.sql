--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:{{ resource | replace("_", "-") }}-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.{{ resource }}_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.{{ resource }}',
            'id'
        )
    ),
    LIKE flex.{{ resource }},
    replaced_by bigint NOT NULL
);

{%- if "history_index" not in data or data.get("history_index") %}

-- changeset flex:{{ resource | replace("_", "-") }}-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
{{ resource }}_history_id_idx
ON flex.{{ resource }}_history (id);
{%- endif %}

-- changeset flex:{{ resource | replace("_", "-") }}-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.{{ resource }}_history
ENABLE ROW LEVEL SECURITY;

{%- if data.get('history_rls')%}

-- changeset flex:{{ resource | replace("_", "-") }}-history-rls-com runAlways:true endDelimiter:--
-- RLS: {{ data.acronym }}-COM001
GRANT SELECT ON flex.{{ resource }}_history
TO flex_common;

CREATE POLICY "{{ data.acronym }}_COM001"
ON flex.{{ resource }}_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM {{ resource }}
    WHERE {{ resource }}_history.id = {{ resource }}.id -- noqa
));
{%- endif %}

-- changeset flex:{{ resource | replace("_", "-") }}-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
{{ resource }}_audit_current
BEFORE INSERT OR UPDATE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:{{ resource | replace("_", "-") }}-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
{{ resource }}_audit_history
AFTER UPDATE OR DELETE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
