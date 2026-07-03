--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-grid-location-rls runOnChange:true endDelimiter:;
ALTER TABLE IF EXISTS accounting_point_grid_location
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point_grid_location
TO flex_internal_event_notification;
DROP POLICY IF EXISTS "APGL_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_grid_location;
CREATE POLICY "APGL_INTERNAL_EVENT_NOTIFICATION" ON accounting_point_grid_location
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: APGL-FISO001
GRANT SELECT, INSERT, UPDATE ON accounting_point_grid_location
TO flex_flexibility_information_system_operator;
DROP POLICY IF EXISTS "APGL_FISO001" ON accounting_point_grid_location;
CREATE POLICY "APGL_FISO001" ON accounting_point_grid_location
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: APGL-SO001
GRANT SELECT, INSERT, UPDATE ON accounting_point_grid_location
TO flex_system_operator;
DROP POLICY IF EXISTS "APGL_SO001" ON accounting_point_grid_location;
CREATE POLICY "APGL_SO001" ON accounting_point_grid_location
FOR ALL
TO flex_system_operator
USING (
    -- CSO
    EXISTS (
        SELECT 1
        FROM accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = accounting_point_grid_location.accounting_point_id -- noqa
            AND ap_so.system_operator_id = (SELECT current_party())
            AND ap_so.valid_time_range @> current_timestamp
    )
    OR
    -- PSO
    EXISTS (
        SELECT 1
        FROM accounting_point_procuring_system_operator AS ap_pso
        WHERE ap_pso.accounting_point_id = accounting_point_grid_location.accounting_point_id -- noqa
            AND ap_pso.procuring_system_operator_id = (SELECT current_party())
    )
);
