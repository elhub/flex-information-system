--liquibase formatted sql
-- Manually managed file

-- changeset flex:system-operator-product-type-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS system_operator_product_type
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON system_operator_product_type
TO flex_internal_event_notification;
CREATE POLICY "SOPT_INTERNAL_EVENT_NOTIFICATION"
ON system_operator_product_type
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON system_operator_product_type_history
TO flex_internal_event_notification;
CREATE POLICY "SOPTH_INTERNAL_EVENT_NOTIFICATION"
ON system_operator_product_type_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT, INSERT, UPDATE ON system_operator_product_type
TO flex_flexibility_information_system_operator;
-- RLS: SOPT-FISO001
CREATE POLICY "SOPT_FISO001"
ON system_operator_product_type
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);
-- RLS: SOPT-FISO002
CREATE POLICY "SOPT_FISO002_INSERT"
ON system_operator_product_type
FOR INSERT
TO flex_flexibility_information_system_operator
WITH CHECK (true);
CREATE POLICY "SOPT_FISO002_UPDATE"
ON system_operator_product_type
FOR UPDATE
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SOPT-COM002
GRANT SELECT ON system_operator_product_type
TO flex_common;
CREATE POLICY "SOPT_COM002"
ON system_operator_product_type
FOR SELECT
TO flex_common
USING (true);

GRANT SELECT, INSERT, UPDATE ON system_operator_product_type
TO flex_system_operator;
-- RLS: SOPT-SO001
CREATE POLICY "SOPT_SO001"
ON system_operator_product_type
FOR SELECT
TO flex_system_operator
USING (
    system_operator_id = (SELECT flex.current_party())
);

-- RLS: SOPT-SO002
CREATE POLICY "SOPT_SO002_INSERT"
ON system_operator_product_type
FOR INSERT
TO flex_system_operator
WITH CHECK (
    system_operator_id = (SELECT flex.current_party())
);
CREATE POLICY "SOPT_SO002_UPDATE"
ON system_operator_product_type
FOR UPDATE
TO flex_system_operator
USING (
    system_operator_id = (SELECT flex.current_party())
);
