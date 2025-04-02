--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-provider-product-application-history-table-create
CREATE TABLE IF NOT EXISTS
flex.service_provider_product_application_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_provider_product_application',
            'id'
        )
    ),
    LIKE flex.service_provider_product_application,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-provider-product-application-history-id-index
CREATE INDEX IF NOT EXISTS
service_provider_product_application_history_id_idx
ON flex.service_provider_product_application_history (id);

-- changeset flex:service-provider-product-application-history-rls
ALTER TABLE IF EXISTS
flex.service_provider_product_application_history
ENABLE ROW LEVEL SECURITY;
