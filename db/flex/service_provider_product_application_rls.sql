--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-application-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_provider_product_application
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_provider_product_application
TO flex_internal_event_notification;
CREATE POLICY "SPPA_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_provider_product_application_history
TO flex_internal_event_notification;
CREATE POLICY "SPPA_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_application_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPPA-FISO001
GRANT SELECT, UPDATE ON service_provider_product_application
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPPA_FISO001"
ON service_provider_product_application
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPPA-SP001
GRANT SELECT, INSERT, UPDATE ON service_provider_product_application
TO flex_service_provider;
CREATE POLICY "SPPA_SP001"
ON service_provider_product_application
FOR ALL
TO flex_service_provider
USING (
    service_provider_id = (SELECT flex.current_party())
    AND (SELECT flex.current_user_has_scope('simple'))
);

-- RLS: SPPA-SO001
GRANT SELECT, UPDATE ON service_provider_product_application
TO flex_system_operator;
CREATE POLICY "SPPA_SO001"
ON service_provider_product_application
FOR SELECT
TO flex_system_operator
USING ((SELECT flex.current_user_has_scope('simple')));

-- RLS: SPPA-SO002
CREATE POLICY "SPPA_SO002"
ON service_provider_product_application
FOR UPDATE
TO flex_system_operator
USING (
    system_operator_id = (SELECT flex.current_party())
    AND (SELECT flex.current_user_has_scope('simple'))
);
