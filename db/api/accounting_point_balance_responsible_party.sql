-- Manually managed file

-- compute the timeline where a SP has CU on an AP
-- (localised around a given time range so as not to compute the whole timeline)
CREATE OR REPLACE FUNCTION local_ap_sp_timeline(
    in_accounting_point_id bigint,
    in_service_provider_id bigint,
    in_local_time_range tstzrange
)
RETURNS tstzmultirange
SECURITY INVOKER
LANGUAGE sql
AS $$
    SELECT range_agg(cusp.valid_time_range)
    FROM flex.controllable_unit_service_provider AS cusp
        INNER JOIN flex.controllable_unit AS cu
            ON cu.id = cusp.controllable_unit_id
        INNER JOIN flex.accounting_point AS ap
            ON ap.business_id = cu.accounting_point_id
    WHERE ap.id = in_accounting_point_id
        AND cusp.service_provider_id = in_service_provider_id
        AND cusp.valid_time_range && in_local_time_range
$$;

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
        CASE WHEN lower(valid_time_range) < current_timestamp + '2w'::interval
                THEN lower(valid_time_range)
        END AS valid_from,
        CASE WHEN upper(valid_time_range) < current_timestamp + '2w'::interval
                THEN upper(valid_time_range)
        END AS valid_to
    FROM ( -- noqa
        SELECT
            id,
            accounting_point_id,
            balance_responsible_party_id,
            energy_direction,
            -- only keep the parts of AP-BRP where SP has a CU on the AP
            unnest(
                multirange(valid_time_range)
                * local_ap_sp_timeline(
                    accounting_point_id,
                    flex.current_party(),
                    valid_time_range
                )
            ) AS valid_time_range
        FROM flex.accounting_point_balance_responsible_party
        WHERE current_role = 'flex_service_provider'
    ) AS ap_brp_for_sp
);

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_internal_event_notification;

GRANT SELECT ON TABLE accounting_point_balance_responsible_party
TO flex_common;
