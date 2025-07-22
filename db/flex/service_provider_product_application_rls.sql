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

GRANT SELECT, UPDATE ON service_provider_product_application
TO flex_flexibility_information_system_operator;
-- RLS: SPPA-FISO001
CREATE POLICY "SPPA_FISO001"
ON service_provider_product_application
FOR SELECT
TO flex_flexibility_information_system_operator
USING ('data:read' IN (SELECT flex.current_scopes()));
-- RLS: SPPA-FISO002
CREATE POLICY "SPPA_FISO002"
ON service_provider_product_application
FOR UPDATE
TO flex_flexibility_information_system_operator
USING ('data:manage' IN (SELECT flex.current_scopes()));

GRANT SELECT, INSERT, UPDATE ON service_provider_product_application
TO flex_service_provider;
-- RLS: SPPA-SP001
CREATE POLICY "SPPA_SP001"
ON service_provider_product_application
FOR SELECT
TO flex_service_provider
USING (
    service_provider_id = (SELECT flex.current_party())
    AND 'data:read' IN (SELECT flex.current_scopes())
);
-- RLS: SPPA-SP002
CREATE POLICY "SPPA_SP002"
ON service_provider_product_application
FOR INSERT
TO flex_service_provider
WITH CHECK (
    service_provider_id = (SELECT flex.current_party())
    AND 'data:manage' IN (SELECT flex.current_scopes())
);
-- RLS: SPPA-SP003
-- NB: status check implemented as a trigger to customise the error message
CREATE POLICY "SPPA_SP003"
ON service_provider_product_application
FOR UPDATE
TO flex_service_provider
USING ('data:manage' IN (SELECT flex.current_scopes()));

-- RLS: SPPA-SO001
GRANT SELECT, UPDATE ON service_provider_product_application
TO flex_system_operator;
CREATE POLICY "SPPA_SO001"
ON service_provider_product_application
FOR SELECT
TO flex_system_operator
USING ('data:read' IN (SELECT flex.current_scopes()));

-- RLS: SPPA-SO002
CREATE POLICY "SPPA_SO002"
ON service_provider_product_application
FOR UPDATE
TO flex_system_operator
USING (
    system_operator_id = (SELECT flex.current_party())
    AND 'data:manage' IN (SELECT flex.current_scopes())
);
