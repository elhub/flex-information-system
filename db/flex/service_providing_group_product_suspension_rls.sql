--liquibase formatted sql
-- Manually managed file

-- changeset flex:service-providing-group-product-suspension-rls runAlways:true endDelimiter:;
ALTER TABLE IF EXISTS service_providing_group_product_suspension
ENABLE ROW LEVEL SECURITY;

-- internal
GRANT SELECT ON service_providing_group_product_suspension
TO flex_internal_event_notification;
CREATE POLICY "SPGPS_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_suspension
FOR SELECT
TO flex_internal_event_notification
USING (true);

GRANT SELECT ON service_providing_group_product_suspension_history
TO flex_internal_event_notification;
CREATE POLICY "SPGPS_HISTORY_INTERNAL_EVENT_NOTIFICATION"
ON service_providing_group_product_suspension_history
FOR SELECT
TO flex_internal_event_notification
USING (true);

-- RLS: SPGPS-FISO001
GRANT SELECT, INSERT, UPDATE, DELETE
ON service_providing_group_product_suspension
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGPS_FISO001"
ON service_providing_group_product_suspension
FOR ALL
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPS-FISO002
GRANT SELECT ON service_providing_group_product_suspension_history
TO flex_flexibility_information_system_operator;
CREATE POLICY "SPGPS_FISO002"
ON service_providing_group_product_suspension_history
FOR SELECT
TO flex_flexibility_information_system_operator
USING (true);

-- RLS: SPGPS-SP001
GRANT SELECT ON service_providing_group_product_suspension
TO flex_service_provider;
CREATE POLICY "SPGPS_SP001"
ON service_providing_group_product_suspension
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = service_providing_group_product_suspension.service_providing_group_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPS-SP002
GRANT SELECT ON service_providing_group_product_suspension_history
TO flex_service_provider;
CREATE POLICY "SPGPS_SP002"
ON service_providing_group_product_suspension_history
FOR SELECT
TO flex_service_provider
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group AS spg
        WHERE spg.id = service_providing_group_product_suspension_history.service_providing_group_id -- noqa
            AND spg.service_provider_id = (SELECT flex.current_party())
    )
);

-- RLS: SPGPS-SO001
GRANT SELECT,
INSERT,
UPDATE,
DELETE ON service_providing_group_product_suspension
TO flex_system_operator;
CREATE POLICY "SPGPS_SO001"
ON service_providing_group_product_suspension
FOR ALL
TO flex_system_operator
USING (procuring_system_operator_id = (SELECT flex.current_party()));

-- RLS: SPGPS-SO002
GRANT SELECT ON service_providing_group_product_suspension_history
TO flex_system_operator;
CREATE POLICY "SPGPS_SO002"
ON service_providing_group_product_suspension_history
FOR SELECT
TO flex_system_operator
USING (procuring_system_operator_id = (SELECT flex.current_party()));

-- RLS: SPGPS-SO003
CREATE POLICY "SPGPS_SO003"
ON service_providing_group_product_suspension
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        SELECT 1
        FROM flex.service_providing_group_product_application AS spgpa
        WHERE spgpa.service_providing_group_id
        = service_providing_group_product_suspension.service_providing_group_id -- noqa
            AND spgpa.procuring_system_operator_id
            = (SELECT flex.current_party())
            AND (
                spgpa.prequalified_at IS NOT null
                OR spgpa.verified_at IS NOT null
            )
            AND service_providing_group_product_suspension.product_type_ids -- noqa
            && spgpa.product_type_ids
    )
);

-- RLS: SPGPS-SO004
CREATE POLICY "SPGPS_SO004"
ON service_providing_group_product_suspension_history
FOR SELECT
TO flex_system_operator
USING (
    EXISTS (
        WITH
            -- history of applications from suspended SPG to current SO
            spgpa_history AS (
                SELECT
                    spgpah.product_type_ids,
                    spgpah.record_time_range,
                    spgpah.prequalified_at,
                    spgpah.verified_at
                FROM
                    flex.service_providing_group_product_application_history
                    AS spgpah -- noqa
                WHERE spgpah.service_providing_group_id
                = service_providing_group_product_suspension_history.service_providing_group_id -- noqa
                    AND spgpah.procuring_system_operator_id
                    = (SELECT flex.current_party())
                UNION ALL
                SELECT
                    spgpa.product_type_ids,
                    spgpa.record_time_range,
                    spgpa.prequalified_at,
                    spgpa.verified_at
                FROM flex.service_providing_group_product_application AS spgpa
                WHERE spgpa.service_providing_group_id
                = service_providing_group_product_suspension_history.service_providing_group_id -- noqa
                    AND spgpa.procuring_system_operator_id
                    = (SELECT flex.current_party())
            )

        SELECT 1
        FROM spgpa_history
        WHERE spgpa_history.record_time_range
            && service_providing_group_product_suspension_history.record_time_range -- noqa
            AND (
                spgpa_history.prequalified_at IS NOT null
                OR spgpa_history.verified_at IS NOT null
            )
            AND service_providing_group_product_suspension_history.product_type_ids -- noqa
            && spgpa_history.product_type_ids
    )
);
