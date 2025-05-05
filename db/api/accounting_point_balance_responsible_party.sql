-- Manually managed file
CREATE OR REPLACE VIEW accounting_point_balance_responsible_party
WITH (security_invoker = true) AS (
    -- RLS: APBRP-FISO001
    SELECT
        id,
        accounting_point_id,
        balance_responsible_party_id,
        energy_direction,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_balance_responsible_party
    WHERE current_role = 'flex_flexibility_information_system_operator'
    -- RLS: APBRP-SO001
    UNION ALL
    SELECT
        ap_brp.id,
        ap_brp.accounting_point_id,
        ap_brp.balance_responsible_party_id,
        ap_brp.energy_direction,
        lower(ap_brp.valid_time_range) AS valid_from,
        upper(ap_brp.valid_time_range) AS valid_to
    FROM flex.accounting_point_balance_responsible_party AS ap_brp -- noqa
        INNER JOIN flex.accounting_point AS ap
            ON ap.id = ap_brp.accounting_point_id
    WHERE current_role = 'flex_system_operator'
        AND ap.system_operator_id = flex.current_party()
    -- RLS: APBRP-SP001
    UNION ALL
    SELECT
        id,
        accounting_point_id,
        balance_responsible_party_id,
        energy_direction,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM ( -- noqa
        SELECT
            ap_brp.id,
            ap_brp.accounting_point_id,
            ap_brp.balance_responsible_party_id,
            ap_brp.energy_direction,
            -- only keep the parts of AP-BRP that belong to the CU-SP timeline
            unnest(
                multirange(ap_brp.valid_time_range)
                * range_agg(cusp.valid_time_range)
            ) AS valid_time_range
        FROM flex.accounting_point_balance_responsible_party AS ap_brp -- noqa
            INNER JOIN flex.accounting_point AS ap
                ON ap.id = ap_brp.accounting_point_id
            INNER JOIN flex.controllable_unit AS cu
                ON cu.accounting_point_id = ap.business_id
            INNER JOIN flex.controllable_unit_service_provider AS cusp
                ON cusp.controllable_unit_id = cu.id
        WHERE current_role = 'flex_service_provider'
            AND cusp.service_provider_id = flex.current_party()
            AND cusp.valid_time_range && ap_brp.valid_time_range
    ) AS ap_brp_for_sp
);

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_common;
