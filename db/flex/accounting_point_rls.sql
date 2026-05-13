--liquibase formatted sql
-- Manually managed file

-- changeset flex:accounting-point-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS accounting_point ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON accounting_point
TO flex_internal_event_notification;
CREATE POLICY "AP_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON accounting_point_history
TO flex_internal_event_notification;
CREATE POLICY "APH_INTERNAL_EVENT_NOTIFICATION"
ON accounting_point_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: AP-FISO001
GRANT SELECT ON accounting_point
TO flex_flexibility_information_system_operator;
CREATE POLICY "AP_FISO001"
ON accounting_point
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: AP-SO001
GRANT SELECT ON accounting_point
TO flex_system_operator;
CREATE POLICY "AP_SO001"
ON accounting_point
FOR SELECT
TO flex_system_operator
USING (
    -- CSO: SO currently owning the MGA of the AP
    EXISTS (
        SELECT 1
        FROM flex.accounting_point_system_operator AS ap_so
        WHERE ap_so.accounting_point_id = accounting_point.id -- noqa
            AND ap_so.system_operator_id = (SELECT flex.current_party())
            AND ap_so.valid_time_range @> CURRENT_TIMESTAMP
    )
    OR
    -- ISO: SO is targeted by a grid prequalification for an SPG that has had a
    -- CU behind this AP
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE cu.accounting_point_id = accounting_point.id -- noqa
            AND EXISTS (
                SELECT 1
                FROM flex.service_providing_group_membership AS spgm
                    INNER JOIN
                        flex.service_providing_group_grid_prequalification
                        AS spggp
                        ON
                            spgm.service_providing_group_id
                            = spggp.service_providing_group_id
                WHERE
                    spgm.controllable_unit_id = cu.id
                    AND spggp.impacted_system_operator_id
                    = (SELECT flex.current_party())
            )
    )
    OR
    -- PSO: SO is targeted by a product application for an SPG that has had a CU
    -- behind this AP
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE cu.accounting_point_id = accounting_point.id -- noqa
            AND EXISTS (
                SELECT 1
                FROM flex.service_providing_group_membership AS spgm
                    INNER JOIN
                        flex.service_providing_group_product_application
                        AS spgpa
                        ON
                            spgm.service_providing_group_id
                            = spgpa.service_providing_group_id
                WHERE
                    spgm.controllable_unit_id = cu.id
                    AND spgpa.procuring_system_operator_id
                    = (SELECT flex.current_party())
            )
    )
);

-- RLS: AP-SP001
GRANT SELECT ON accounting_point
TO flex_service_provider;
CREATE POLICY "AP_SP001"
ON accounting_point
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.controllable_unit AS cu
        WHERE cu.accounting_point_id = accounting_point.id -- noqa
            AND EXISTS (
                SELECT 1
                FROM flex.controllable_unit_service_provider AS cusp
                WHERE
                    cusp.controllable_unit_id = cu.id
                    AND cusp.service_provider_id = (SELECT flex.current_party())
            )
    )
);

GRANT INSERT, SELECT, UPDATE, DELETE ON accounting_point TO flex_internal_data;
CREATE POLICY "AP_INTERNAL_DATA"
ON accounting_point
FOR ALL
TO flex_internal_data
USING (true);

GRANT SELECT, UPDATE, DELETE ON accounting_point_sync TO flex_internal_data;
