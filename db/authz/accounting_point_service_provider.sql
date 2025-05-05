CREATE OR REPLACE VIEW accounting_point_service_provider AS (
    SELECT
        ap.id AS accounting_point_id,
        cusp.service_provider_id,
        range_agg(cusp.valid_time_range) AS valid_timeline
    FROM flex.controllable_unit_service_provider AS cusp -- noqa
        INNER JOIN flex.controllable_unit AS cu
            ON cusp.controllable_unit_id = cu.id
        INNER JOIN flex.accounting_point AS ap
            ON ap.business_id = cu.accounting_point_id
    GROUP BY ap.id, cusp.service_provider_id
);

GRANT SELECT ON TABLE accounting_point_service_provider
TO flex_common;

GRANT SELECT ON TABLE accounting_point_service_provider
TO flex_internal_event_notification;
