--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-providing-group-product-application-history-table-create
CREATE TABLE IF NOT EXISTS
flex.service_providing_group_product_application_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_providing_group_product_application',
            'id'
        )
    ),
    LIKE flex.service_providing_group_product_application,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-providing-group-product-application-history-id-index
CREATE INDEX IF NOT EXISTS
service_providing_group_product_application_history_id_idx
ON flex.service_providing_group_product_application_history (id);

-- changeset flex:service-providing-group-product-application-history-rls
ALTER TABLE IF EXISTS
flex.service_providing_group_product_application_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:service-providing-group-product-application-audit-current
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_providing_group_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:service-providing-group-product-application-audit-history
CREATE OR REPLACE TRIGGER
service_providing_group_product_application_audit_history
AFTER UPDATE OR DELETE
ON flex.service_providing_group_product_application
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
