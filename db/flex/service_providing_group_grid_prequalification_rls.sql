ALTER TABLE IF EXISTS service_providing_group_grid_prequalification
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_grid_prequalification
TO flex_internal_event_notification;
CREATE POLICY "SPGGP_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_prequalification
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_grid_prequalification_history
TO flex_internal_event_notification;
CREATE POLICY "SPGGPH_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_grid_prequalification_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGGP-FISO001
GRANT SELECT, INSERT, UPDATE ON service_providing_group_grid_prequalification
TO flex_flexibility_information_system_operator;

CREATE POLICY "SPGGP_FISO001"
ON service_providing_group_grid_prequalification
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGGP-SP001
GRANT SELECT ON service_providing_group_grid_prequalification
TO flex_service_provider;

CREATE POLICY "SPGGP_SP001"
ON service_providing_group_grid_prequalification
FOR ALL
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1 FROM service_providing_group
        WHERE service_providing_group_grid_prequalification.service_providing_group_id = service_providing_group.id -- noqa
            AND service_providing_group.service_provider_id = current_party()
    )
);

-- RLS: SPGGP-SO001
GRANT SELECT, UPDATE ON service_providing_group_grid_prequalification
TO flex_system_operator;

CREATE POLICY "SPGGP_SO001"
ON service_providing_group_grid_prequalification
FOR ALL
TO flex_system_operator
USING (
    impacted_system_operator_id = current_party()
);

-- RLS: SPGGP-SO002

-- cannot use a simple select on SPG because then policies would be recursive
-- (SPG uses SPGGP in its policies)
-- => hence the function
-- the check performed by the function is made locally (on the same table)
-- so it must run as the system so as to see the other rows
-- => hence the security definer
CREATE OR REPLACE FUNCTION current_party_impacted_in_spg(spg_id bigint)
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
AS $$
-- SELECT is OK for an SO impacted by a SPGGP in the same SPG
SELECT EXISTS (
    SELECT 1 FROM service_providing_group_grid_prequalification
    WHERE service_providing_group_id = spg_id
    AND impacted_system_operator_id = current_party()
)
$$;

CREATE POLICY "SPGGP_SO002"
ON service_providing_group_grid_prequalification
FOR SELECT
TO flex_system_operator
USING (current_party_impacted_in_spg(service_providing_group_id));
