-- GENERATED CODE -- DO NOT EDIT
CREATE OR REPLACE TRIGGER
logic.{{ resource }}_audit_current
BEFORE INSERT OR UPDATE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

{% if data.history -%}
CREATE OR REPLACE TRIGGER
logic.{{ resource }}_audit_history
AFTER UPDATE OR DELETE
ON flex.{{ resource }}
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
{% endif %}
