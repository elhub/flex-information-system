--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-application-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_product_application
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_product_application
TO flex_internal_event_notification;
CREATE POLICY "SPGPA_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_product_application_history
TO flex_internal_event_notification;
CREATE POLICY "SPGPA_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_application_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGPA-FISO001
GRANT SELECT, UPDATE ON service_providing_group_product_application
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGPA_FISO001"
ON service_providing_group_product_application
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPA-SP001
GRANT SELECT, INSERT, UPDATE ON service_providing_group_product_application
TO flex_service_provider;
CREATE POLICY "SPGPA_SP001"
ON service_providing_group_product_application
FOR ALL
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM service_providing_group
        WHERE service_providing_group_product_application.service_providing_group_id = service_providing_group.id -- noqa
            AND service_providing_group.service_provider_id = (SELECT flex.current_party()) -- noqa
    )
    AND (SELECT flex.current_user_has_scope('simple'))
);

-- RLS: SPGPA-SO001
GRANT SELECT, UPDATE ON service_providing_group_product_application
TO flex_system_operator;
CREATE POLICY "SPGPA_SO001"
ON service_providing_group_product_application
FOR SELECT
TO flex_system_operator
USING ((SELECT flex.current_user_has_scope('simple')));

-- RLS: SPGPA-SO002
CREATE POLICY "SPGPA_SO002"
ON service_providing_group_product_application
FOR UPDATE
TO flex_system_operator
USING (
    procuring_system_operator_id = (SELECT flex.current_party())
    AND (SELECT flex.current_user_has_scope('simple'))
);
