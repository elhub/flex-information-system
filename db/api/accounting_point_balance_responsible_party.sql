--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-balance-responsible-party-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_balance_responsible_party
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
            ap_brp.id,
            ap_brp.accounting_point_id,
            ap_brp.balance_responsible_party_id,
            ap_brp.energy_direction,
            -- only keep the parts of AP-BRP where SP has a CU on the AP
            unnest(
                multirange(ap_brp.valid_time_range)
                * range_agg(ap_sp.valid_time_range)
            ) AS valid_time_range
        FROM flex.accounting_point_balance_responsible_party AS ap_brp -- noqa
            INNER JOIN flex.accounting_point_service_provider AS ap_sp
                ON ap_sp.accounting_point_id = ap_brp.accounting_point_id
                    AND ap_sp.valid_time_range && ap_brp.valid_time_range
        WHERE current_role = 'flex_service_provider'
            AND ap_sp.service_provider_id = flex.current_party()
        GROUP BY
            ap_brp.id,
            ap_brp.accounting_point_id,
            ap_brp.balance_responsible_party_id,
            ap_brp.energy_direction,
            ap_brp.valid_time_range
    ) AS ap_brp_for_sp
);
