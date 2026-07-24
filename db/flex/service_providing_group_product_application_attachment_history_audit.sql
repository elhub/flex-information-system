--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-product-application-attachment-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.service_providing_group_product_application_attachment_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_product_application_attachment',
            'id'
        )
    ),
    LIKE flex.service_providing_group_product_application_attachment,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-providing-group-product-application-attachment-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
service_providing_group_product_application_attachment_history_id_idx
ON flex.service_providing_group_product_application_attachment_history (id);

-- changeset flex:service-providing-group-product-application-attachment-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.service_providing_group_product_application_attachment_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:service-providing-group-product-application-attachment-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_attachment_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_providing_group_product_application_attachment
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:service-providing-group-product-application-attachment-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_attachment_audit_history
AFTER UPDATE OR DELETE
ON flex.service_providing_group_product_application_attachment
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
