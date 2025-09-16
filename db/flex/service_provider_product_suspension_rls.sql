--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-provider-product-suspension-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_provider_product_suspension
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_provider_product_suspension
TO flex_internal_event_notification;
CREATE POLICY "SPPS_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_suspension
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_provider_product_suspension_history
TO flex_internal_event_notification;
CREATE POLICY "SPPS_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_provider_product_suspension_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPPS-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_provider_product_suspension
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPPS_FISO001"
ON service_provider_product_suspension
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPPS-COM001
GRANT SELECT ON service_provider_product_suspension_history
TO flex_common;
CREATE POLICY "SPPS_COM001"
ON service_provider_product_suspension_history
FOR SELECT
TO flex_common
USING (EXISTS (
    SELECT 1
    FROM service_provider_product_suspension
    WHERE service_provider_product_suspension_history.id = service_provider_product_suspension.id -- noqa
));

-- RLS: SPPS-SP001
GRANT SELECT ON service_provider_product_suspension
TO flex_service_provider;
CREATE POLICY "SPPS_SP001"
ON service_provider_product_suspension
FOR SELECT
TO flex_service_provider
USING (service_provider_id = (SELECT flex.current_party()));

-- RLS: SPPS-SP002
GRANT SELECT ON service_provider_product_suspension_history
TO flex_service_provider;
CREATE POLICY "SPPS_SP002"
ON service_provider_product_suspension_history
FOR SELECT
TO flex_service_provider
USING (service_provider_id = (SELECT flex.current_party()));

-- RLS: SPPS-SO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_provider_product_suspension
TO flex_system_operator;
CREATE POLICY "SPPS_SO001"
ON service_provider_product_suspension
FOR ALL
TO flex_system_operator
USING (procuring_system_operator_id = (SELECT flex.current_party()));

-- RLS: SPPS-SO002
CREATE POLICY "SPPS_SO002"
ON service_provider_product_suspension
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT
            service_provider_product_suspension.product_type_ids -- noqa
            && sppa.product_type_ids
        FROM flex.service_provider_product_application AS sppa
        WHERE sppa.service_provider_id
            = service_provider_product_suspension.service_provider_id -- noqa
            AND sppa.system_operator_id = (SELECT flex.current_party())
            AND sppa.status = 'qualified'
    )
);
