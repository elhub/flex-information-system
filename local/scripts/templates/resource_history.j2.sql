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
