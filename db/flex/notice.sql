--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW notice AS (
    -- CU grid node ID missing
    SELECT
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_node_id.missing' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN accounting_point_system_operator AS ap_so
            ON cu.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE cu.grid_node_id IS null

    -- CU grid validation status pending
    UNION ALL
    SELECT
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.pending' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN accounting_point_system_operator AS ap_so
            ON cu.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE cu.grid_validation_status = 'pending'

    -- CU grid validation status incomplete information
    UNION ALL
    SELECT
        cusp.service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.incomplete_information' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
    WHERE cusp.valid_time_range @> current_timestamp
        AND cu.grid_validation_status = 'incomplete_information'

    -- SP product application status requested
    UNION ALL
    SELECT
        sppa.system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_application.status.requested' AS type, -- noqa
        '/service_provider_product_application/' || sppa.id AS source,
        null AS data -- noqa
    FROM service_provider_product_application AS sppa
    WHERE sppa.status = 'requested'

    -- SPGM inconsistency
    UNION ALL
    SELECT -- noqa
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_membership.valid_time.outside_contract' AS type, -- noqa
        '/service_providing_group_membership/' || spgm.id AS source,
        null AS data -- noqa
    FROM flex.service_providing_group_membership AS spgm -- noqa
        INNER JOIN flex.service_providing_group AS spg
            ON spg.id = spgm.service_providing_group_id
    WHERE NOT EXISTS (
            SELECT 1 FROM (
                SELECT
                    controllable_unit_id,
                    service_provider_id,
                    range_agg(valid_time_range) AS valid_timeline
                FROM flex.controllable_unit_service_provider
                WHERE lower(valid_time_range) IS NOT null
                GROUP BY controllable_unit_id, service_provider_id
            ) AS cusp
            WHERE spgm.controllable_unit_id = cusp.controllable_unit_id
                AND spg.service_provider_id = cusp.service_provider_id
                AND cusp.valid_timeline @> spgm.valid_time_range
        )

    -- SPG product application status requested
    UNION ALL
    SELECT
        spgpa.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_application.status.requested' AS type, -- noqa
        '/service_providing_group_product_application/' || spgpa.id AS source, -- noqa
        null AS data -- noqa
    FROM service_providing_group_product_application AS spgpa
    WHERE spgpa.status = 'requested'

    -- SPG grid prequalification status requested
    UNION ALL
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested' AS type, -- noqa
        '/service_providing_group_grid_prequalification/' || spggp.id AS source, -- noqa
        null AS data -- noqa
    FROM service_providing_group_grid_prequalification AS spggp
    WHERE spggp.status = 'requested'

    -- SPG containing CUs with more than one BRP
    -- TODO: consider energy direction in the check
    --       (cf. https://elhub.atlassian.net/browse/FLEX-615)
    UNION ALL
    SELECT
        sp_id AS party_id,
        'no.elhub.flex.service_providing_group.balance_responsible_party.multiple' AS type, -- noqa
        '/service_providing_group/' || spg_id AS source,
        null AS data -- noqa
    FROM (
        SELECT
            spg.id AS spg_id,
            spg.service_provider_id AS sp_id,
            count(DISTINCT apbrp.balance_responsible_party_id) AS nb_brp
        FROM flex.service_providing_group AS spg
            INNER JOIN flex.service_providing_group_membership AS spgm
                ON spg.id = spgm.service_providing_group_id
                    AND spgm.valid_time_range @> current_timestamp
            INNER JOIN flex.controllable_unit AS cu
                ON spgm.controllable_unit_id = cu.id
            INNER JOIN
                flex.accounting_point_balance_responsible_party AS apbrp
                ON cu.accounting_point_id = apbrp.accounting_point_id
                    AND apbrp.valid_time_range @> current_timestamp
        GROUP BY spg.id
    ) AS spg_brp_count
    WHERE nb_brp > 1

    -- CUSPs not fully covered by the end user contract
    UNION ALL
    SELECT
        service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract' AS type, -- noqa
        '/controllable_unit_service_provider/' || id AS source,
        jsonb_build_object(
            'invalid_timeline',
            valid_time_range - end_user_timeline
        )::text AS data -- noqa
    FROM (
        SELECT
            cusp.id,
            cusp.service_provider_id,
            multirange(cusp.valid_time_range) AS valid_time_range,
            coalesce(
                range_agg(apeu.valid_time_range), '{}'::tstzmultirange
            ) AS end_user_timeline
        FROM flex.controllable_unit_service_provider AS cusp
            INNER JOIN flex.controllable_unit AS cu
                ON cusp.controllable_unit_id = cu.id
            LEFT JOIN flex.accounting_point_end_user AS apeu
                ON cu.accounting_point_id = apeu.accounting_point_id
                    AND cusp.end_user_id = apeu.end_user_id
                    AND cusp.valid_time_range && apeu.valid_time_range
        GROUP BY cusp.id
    ) AS cusp_with_eu
    WHERE NOT end_user_timeline @> valid_time_range
);
