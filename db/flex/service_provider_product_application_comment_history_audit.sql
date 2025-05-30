--liquibase formatted sql
-- GENERATED CODE -- DO NOT EDIT

-- changeset flex:service-provider-product-application-comment-history-table-create endDelimiter:--
CREATE TABLE IF NOT EXISTS
flex.service_provider_product_application_comment_history (
    history_id bigint PRIMARY KEY NOT NULL
    DEFAULT nextval(
        pg_get_serial_sequence(
            'flex.service_provider_product_application_comment',
            'id'
        )
    ),
    LIKE flex.service_provider_product_application_comment,
    replaced_by bigint NOT NULL
);

-- changeset flex:service-provider-product-application-comment-history-id-index endDelimiter:--
CREATE INDEX IF NOT EXISTS
service_provider_product_application_comment_history_id_idx
ON flex.service_provider_product_application_comment_history (id);

-- changeset flex:service-provider-product-application-comment-history-rls endDelimiter:--
ALTER TABLE IF EXISTS
flex.service_provider_product_application_comment_history
ENABLE ROW LEVEL SECURITY;

-- changeset flex:service-provider-product-application-comment-history-rls-com runAlways:true endDelimiter:--
-- RLS: SPPAC-COM001
GRANT SELECT ON flex.service_provider_product_application_comment_history
TO flex_common;

CREATE POLICY "SPPAC_COM001"
ON flex.service_provider_product_application_comment_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_provider_product_application_comment
    WHERE service_provider_product_application_comment_history.id = service_provider_product_application_comment.id -- noqa
));

-- changeset flex:service-provider-product-application-comment-audit-current endDelimiter:--
CREATE OR REPLACE TRIGGER
service_provider_product_application_comment_audit_current
BEFORE INSERT OR UPDATE
ON flex.service_provider_product_application_comment
FOR EACH ROW EXECUTE PROCEDURE audit.current(
    'flex.current_identity'
);

-- changeset flex:service-provider-product-application-comment-audit-history endDelimiter:--
CREATE OR REPLACE TRIGGER
service_provider_product_application_comment_audit_history
AFTER UPDATE OR DELETE
ON flex.service_provider_product_application_comment
FOR EACH ROW EXECUTE PROCEDURE audit.history(
    'flex.current_identity'
);
