--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-comment-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_provider_product_application_comment
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_provider_product_application_comment
TO flex_internal_event_notification;
CREATE POLICY "SPPAC_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application_comment
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE
ON service_provider_product_application_comment
TO flex_common;

-- RLS: SPPAC-COM002
CREATE POLICY "SPPAC_COM002"
ON service_provider_product_application_comment
FOR UPDATE
TO flex_common
USING (created_by = (SELECT flex.current_identity()));

-- RLS: SPPAC-COM003
CREATE POLICY "SPPAC_COM003"
ON service_provider_product_application_comment
FOR INSERT
TO flex_common
WITH CHECK (
    (SELECT flex.current_party()) IN (
        SELECT unnest(ARRAY[sppa.system_operator_id, sppa.service_provider_id])
        FROM service_provider_product_application AS sppa
        WHERE sppa.id = service_provider_product_application_comment.service_provider_product_application_id -- noqa
    )
);

-- RLS: SPPAC-SO001
-- RLS: SPPAC-SP001
CREATE POLICY "SPPAC_SO001_SP001"
ON service_provider_product_application_comment
FOR SELECT
TO flex_common
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_provider_product_application AS sppa
            INNER JOIN flex.identity AS comment_creator
                ON service_provider_product_application_comment.created_by -- noqa
                    = comment_creator.id
        WHERE sppa.id = service_provider_product_application_comment.service_provider_product_application_id -- noqa
            AND ((
                service_provider_product_application_comment.visibility = 'same_party' -- noqa
                AND comment_creator.party_id = (SELECT flex.current_party()) -- noqa
            ) OR (
                service_provider_product_application_comment.visibility = 'any_involved_party' -- noqa
                AND (SELECT flex.current_party()) IN (
                    sppa.system_operator_id,
                    sppa.service_provider_id
                )
            ))
    )
);

-- RLS: SPPAC-FISO001
CREATE POLICY "SPPAC_FISO001"
ON service_provider_product_application_comment
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);
