--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-suspension-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS controllable_unit_suspension
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON controllable_unit_suspension
TO flex_internal_event_notification;
CREATE POLICY "CUS_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_suspension
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON controllable_unit_suspension_history
TO flex_internal_event_notification;
CREATE POLICY "CUS_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON controllable_unit_suspension_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: CUS-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON controllable_unit_suspension
TO flex_flexibility_information_system_operator;
CREATE POLICY "CUS_FISO001"
ON controllable_unit_suspension
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CUS-FISO002
GRANT SELECT ON controllable_unit_suspension_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "CUS_FISO002"
ON controllable_unit_suspension_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: CUS-SP001
GRANT SELECT ON controllable_unit_suspension
TO flex_service_provider;
CREATE POLICY "CUS_SP001"
ON controllable_unit_suspension
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.controllable_unit_id
        = controllable_unit_suspension.controllable_unit_id -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
            AND cusp.valid_time_range
            && controllable_unit_suspension.record_time_range -- noqa
    )
);

-- RLS: CUS-SP002
GRANT SELECT ON controllable_unit_suspension_history
TO flex_service_provider;
CREATE POLICY "CUS_SP002"
ON controllable_unit_suspension_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit_service_provider AS cusp
        WHERE cusp.controllable_unit_id
        = controllable_unit_suspension_history.controllable_unit_id -- noqa
            AND cusp.service_provider_id = (SELECT flex.current_party())
            AND cusp.valid_time_range
            && controllable_unit_suspension_history.record_time_range -- noqa
    )
);

-- RLS: CUS-SO001
GRANT SELECT, INSERT, UPDATE, DELETE ON controllable_unit_suspension
TO flex_system_operator;
CREATE POLICY "CUS_SO001"
ON controllable_unit_suspension
FOR ALL
TO flex_system_operator
USING (impacted_system_operator_id = (SELECT flex.current_party()));

-- RLS: CUS-SO002
GRANT SELECT ON controllable_unit_suspension_history
TO flex_system_operator;
CREATE POLICY "CUS_SO002"
ON controllable_unit_suspension_history
FOR SELECT
TO flex_system_operator
USING (impacted_system_operator_id = (SELECT flex.current_party()));

-- RLS: CUS-SO003
CREATE POLICY "CUS_SO003"
ON controllable_unit_suspension
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE cu.id = controllable_unit_suspension.controllable_unit_id -- noqa
    )
);

-- RLS: CUS-SO004
CREATE POLICY "CUS_SO004"
ON controllable_unit_suspension_history
FOR SELECT
TO flex_system_operator

USING (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE cu.id = controllable_unit_suspension_history.controllable_unit_id -- noqa
    )
);
