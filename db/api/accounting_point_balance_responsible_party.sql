--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-balance-responsible-party-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_balance_responsible_party
-- We are enforching "RLS" in the view definition. Therefore we want
--  * security definer (invoker = false) to avoid the performance hit of RLS
--  * security barrier since it is considered good practice ref https://www.postgresql.org/docs/current/rules-privileges.html
WITH (security_invoker = false, security_barrier = true) AS (
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
        id,
        accounting_point_id,
        balance_responsible_party_id,
        energy_direction,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM (
        SELECT
            ap_brp.id,
            ap_brp.accounting_point_id,
            ap_brp.balance_responsible_party_id,
            ap_brp.energy_direction,
            -- only keep the parts of AP-BRP where SO is SO on the AP
            unnest(
                multirange(ap_brp.valid_time_range)
                * range_agg(ap_so.valid_time_range)
            ) AS valid_time_range
        FROM flex.accounting_point_balance_responsible_party AS ap_brp -- noqa
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON ap_so.accounting_point_id = ap_brp.accounting_point_id
                    AND ap_so.valid_time_range && ap_brp.valid_time_range
        WHERE current_role = 'flex_system_operator'
            AND ap_so.system_operator_id = flex.current_party()
        GROUP BY
            ap_brp.id,
            ap_brp.accounting_point_id,
            ap_brp.balance_responsible_party_id,
            ap_brp.energy_direction,
            ap_brp.valid_time_range
    ) AS ap_brp_for_so
    -- RLS: APBRP-SP001
    UNION ALL
    SELECT
        id,
        accounting_point_id,
        balance_responsible_party_id,
        energy_direction,
        lower(valid_time_range) AS valid_from,
        -- allow window so SP does not see too far in the future
        CASE WHEN upper(valid_time_range) > current_timestamp + '2w'::interval
                THEN null
            ELSE upper(valid_time_range)
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
    -- allow window, see above
    WHERE lower(valid_time_range) < current_timestamp + '2w'::interval
);
