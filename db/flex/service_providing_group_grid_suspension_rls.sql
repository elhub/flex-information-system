--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-grid-suspension-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_grid_suspension
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_grid_suspension
TO flex_internal_event_notification;
CREATE POLICY "SPGGS_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_suspension
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_grid_suspension_history
TO flex_internal_event_notification;
CREATE POLICY "SPGGS_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_suspension_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGGS-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_grid_suspension
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGGS_FISO001"
ON service_providing_group_grid_suspension
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGGS-FISO002
GRANT SELECT ON service_providing_group_grid_suspension_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGGS_FISO002"
ON service_providing_group_grid_suspension_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGGS-SP001
GRANT SELECT ON service_providing_group_grid_suspension
TO flex_service_provider;
CREATE POLICY "SPGGS_SP001"
ON service_providing_group_grid_suspension
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = service_providing_group_grid_suspension.service_providing_group_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGS-SP002
GRANT SELECT ON service_providing_group_grid_suspension_history
TO flex_service_provider;
CREATE POLICY "SPGGS_SP002"
ON service_providing_group_grid_suspension_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = service_providing_group_grid_suspension_history.service_providing_group_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGGS-SO001
GRANT SELECT, INSERT, UPDATE, DELETE ON service_providing_group_grid_suspension
TO flex_system_operator;
CREATE POLICY "SPGGS_SO001"
ON service_providing_group_grid_suspension
FOR ALL
TO flex_system_operator
USING (impacted_system_operator_id = (SELECT flex.current_party()));

-- RLS: SPGGS-SO002
GRANT SELECT ON service_providing_group_grid_suspension_history
TO flex_system_operator;
CREATE POLICY "SPGGS_SO002"
ON service_providing_group_grid_suspension_history
FOR SELECT
TO flex_system_operator
USING (impacted_system_operator_id = (SELECT flex.current_party()));

-- RLS: SPGGS-SO003
CREATE POLICY "SPGGS_SO003"
ON service_providing_group_grid_suspension
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id
            = service_providing_group_grid_suspension.service_providing_group_id -- noqa
    )
);

-- RLS: SPGGS-SO004
CREATE POLICY "SPGGS_SO004"
ON service_providing_group_grid_suspension_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id
            = service_providing_group_grid_suspension_history.service_providing_group_id -- noqa
        UNION ALL
        SELECT 1
        FROM flex.service_providing_group_history AS spgh
        WHERE spgh.id
            = service_providing_group_grid_suspension_history.service_providing_group_id -- noqa
            AND spgh.record_time_range && service_providing_group_grid_suspension_history.record_time_range -- noqa
    )
);
