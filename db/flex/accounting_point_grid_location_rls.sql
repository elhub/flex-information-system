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
    -- CSO: SO is the current connecting system operator for the AP
    EXISTS (
        SELECT 1
        FROM accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = accounting_point_grid_location.accounting_point_id -- noqa
            AND ap_so.system_operator_id = (SELECT current_party())
            AND ap_so.valid_time_range @> current_timestamp
    )
    OR
    -- Procuring SO: SO has a product application on an SPG
    -- that currently has a CU behind this accounting point as an active member
    EXISTS (
        SELECT 1
        FROM service_providing_group_product_application AS spgpa
            INNER JOIN service_providing_group_membership AS spgm
                ON
                    spgpa.service_providing_group_id = spgm.service_providing_group_id
                    AND spgm.valid_time_range @> current_timestamp
            INNER JOIN controllable_unit AS cu
                ON spgm.controllable_unit_id = cu.id
        WHERE
            spgpa.procuring_system_operator_id = (SELECT current_party())
            AND cu.accounting_point_id = accounting_point_grid_location.accounting_point_id -- noqa
    )
);
