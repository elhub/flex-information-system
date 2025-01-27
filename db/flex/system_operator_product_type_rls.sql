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

-- RLS: SOPT-FISO001
GRANT SELECT, INSERT, UPDATE ON system_operator_product_type
TO flex_flexibility_information_system_operator;
CREATE POLICY "SOPT_FISO001"
ON system_operator_product_type
FOR ALL
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

-- RLS: SOPT-SO001
GRANT SELECT, INSERT, UPDATE ON system_operator_product_type
TO flex_system_operator;
CREATE POLICY "SOPT_SO001"
ON system_operator_product_type
FOR ALL
TO flex_system_operator
USING (
    system_operator_id = flex.current_party()
);
