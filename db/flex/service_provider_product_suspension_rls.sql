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

-- RLS: SPPS-SP001
GRANT SELECT ON service_provider_product_suspension
TO flex_service_provider;
CREATE POLICY "SPPS_SP001"
ON service_provider_product_suspension
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
    SELECT EXISTS(
        SELECT 1
        FROM flex.service_providing_group_product_application AS spgpa
            INNER JOIN flex.service_providing_group AS spg
                ON spgpa.service_providing_group_id = spg.id
        WHERE spg.service_provider_id
            = service_provider_product_suspension.service_provider_id -- noqa
            AND spgpa.procuring_system_operator_id
            = (SELECT flex.current_party())
            AND spgpa.product_type_id
            = ANY(service_provider_product_suspension.product_type_ids) -- noqa
            AND spgpa.status
            IN ('temporary_qualified', 'prequalified', 'verified')
    )
);
