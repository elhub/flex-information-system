--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-accounting-point-energy-supplier-create endDelimiter:-- runAlways:true
CREATE OR REPLACE VIEW api.accounting_point_energy_supplier
WITH (security_invoker = false, security_barrier = true) AS ( -- cf AP-BRP
    -- RLS: APES-FISO001
    SELECT
        accounting_point_id,
        energy_supplier_id,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM flex.accounting_point_energy_supplier
    WHERE current_role = 'flex_flexibility_information_system_operator'
    -- RLS: APES-SO001
    UNION ALL
    SELECT
        accounting_point_id,
        energy_supplier_id,
        lower(valid_time_range) AS valid_from,
        upper(valid_time_range) AS valid_to
    FROM (
        SELECT
            ap_es.accounting_point_id,
            ap_es.energy_supplier_id,
            -- only keep the parts of AP-ES where SO is SO on the AP
            unnest(
                multirange(ap_es.valid_time_range)
                * range_agg(ap_so.valid_time_range)
            ) AS valid_time_range
        FROM flex.accounting_point_energy_supplier AS ap_es -- noqa
            INNER JOIN flex.accounting_point_system_operator AS ap_so
                ON ap_so.accounting_point_id = ap_es.accounting_point_id
                    AND ap_so.valid_time_range && ap_es.valid_time_range
        WHERE current_role = 'flex_system_operator'
            AND ap_so.system_operator_id = flex.current_party()
        GROUP BY
            ap_es.accounting_point_id,
            ap_es.energy_supplier_id,
            ap_es.valid_time_range
    ) AS ap_es_for_so
    -- RLS: APES-SP001
    UNION ALL
    SELECT
        accounting_point_id,
        energy_supplier_id,
        lower(valid_time_range) AS valid_from,
        -- allow window so SP does not see too far in the future
        CASE WHEN upper(valid_time_range) > current_timestamp + '2w'::interval
                THEN null
            ELSE upper(valid_time_range)
        END AS valid_to
    FROM ( -- noqa
        SELECT
            ap_es.accounting_point_id,
            ap_es.energy_supplier_id,
            -- only keep the parts of AP-ES where SP has a CU on the AP
            unnest(
                multirange(ap_es.valid_time_range)
                * range_agg(ap_sp.valid_time_range)
            ) AS valid_time_range
        FROM flex.accounting_point_energy_supplier AS ap_es -- noqa
            INNER JOIN flex.accounting_point_service_provider AS ap_sp
                ON ap_sp.accounting_point_id = ap_es.accounting_point_id
                    AND ap_sp.valid_time_range && ap_es.valid_time_range
        WHERE current_role = 'flex_service_provider'
            AND ap_sp.service_provider_id = flex.current_party()
        GROUP BY
            ap_es.accounting_point_id,
            ap_es.energy_supplier_id,
            ap_es.valid_time_range
    ) AS ap_es_for_sp
    -- allow window, see above
    WHERE lower(valid_time_range) < current_timestamp + '2w'::interval
);
