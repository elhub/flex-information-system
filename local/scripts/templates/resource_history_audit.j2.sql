--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:{{ resource | replace("_", "-") }}-history-table-create
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

-- changeset flex:{{ resource | replace("_", "-") }}-history-id-index
CREATE INDEX IF NOT EXISTS
{{ resource }}_history_id_idx
ON flex.{{ resource }}_history (id);

-- changeset flex:{{ resource | replace("_", "-") }}-history-rls
ALTER TABLE IF EXISTS
flex.{{ resource }}_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:{{ resource | replace("_", "-") }}-audit-current
CREATE OR REPLACE TRIGGER
{{ resource }}_audit_current
BEFORE INSERT OR UPDATE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

{% if data.history -%}
-- changeset flex:{{ resource | replace("_", "-") }}-audit-history
CREATE OR REPLACE TRIGGER
{{ resource }}_audit_history
AFTER UPDATE OR DELETE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
{% endif -%}
