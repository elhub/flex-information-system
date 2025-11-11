--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice runOnChange:true endDelimiter:--
-- DROP + CREATE instead of CREATE OR REPLACE: cf https://stackoverflow.com/a/65118443
DROP VIEW IF EXISTS notice CASCADE;
CREATE VIEW notice AS (
    -- CU grid node ID missing
    SELECT -- noqa
        ap_so.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_node_id.missing' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null::jsonb AS data -- noqa
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
        null::jsonb AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN accounting_point_system_operator AS ap_so
            ON cu.accounting_point_id = ap_so.accounting_point_id
                AND ap_so.valid_time_range @> current_timestamp
    WHERE cu.grid_validation_status = 'pending'
        AND cu.status = 'active'

    -- CU grid validation status incomplete information
    UNION ALL
    SELECT
        cusp.service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.incomplete_information' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null::jsonb AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN controllable_unit_service_provider AS cusp
            ON cu.id = cusp.controllable_unit_id
    WHERE cusp.valid_time_range @> current_timestamp
        AND cu.grid_validation_status = 'incomplete_information'
        AND cu.status = 'active'

    -- SP product application status requested
    UNION ALL
    SELECT
        sppa.system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_application.status.requested' AS type, -- noqa
        '/service_provider_product_application/' || sppa.id AS source,
        null::jsonb AS data -- noqa
    FROM service_provider_product_application AS sppa
    WHERE sppa.status = 'requested'

    -- SPGM inconsistency
    UNION ALL
    SELECT -- noqa
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_membership.valid_time.outside_contract' AS type, -- noqa
        '/service_providing_group_membership/' || spgm.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_membership AS spgm -- noqa
        INNER JOIN flex.service_providing_group AS spg
            ON spgm.service_providing_group_id = spg.id
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
        null::jsonb AS data -- noqa
    FROM service_providing_group_product_application AS spgpa
    WHERE spgpa.status = 'requested'

    -- SPG grid prequalification status requested
    UNION ALL
    SELECT
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested' AS type, -- noqa
        '/service_providing_group_grid_prequalification/' || spggp.id AS source, -- noqa
        null::jsonb AS data -- noqa
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
        null::jsonb AS data -- noqa
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
            (
                SELECT
                    array_to_json(
                        array_agg(
                            jsonb_build_object(
                                'valid_from', lower(timeline_section),
                                'valid_to', upper(timeline_section)
                            )
                        )
                    )
                FROM (
                    SELECT
                        unnest(valid_time_range - end_user_timeline)
                        AS timeline_section
                ) AS invalid_timeline_sections
            )
        ) AS data -- noqa
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

    -- new staging parties synced from external source but not in the system yet
    UNION ALL
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.missing' AS type, -- noqa
        null AS source, -- no source because the party does not exist yet
        jsonb_build_object(
            'entity', jsonb_strip_nulls(
                jsonb_build_object(
                    'business_id', p_stg.org,
                    'business_id_type', e_stg.business_id_type,
                    'name', e_stg.name,
                    'type', e_stg.type
                )
            ),
            'party', jsonb_strip_nulls(
                jsonb_build_object(
                    'business_id', p_stg.gln,
                    'business_id_type', 'gln',
                    'entity_id', e_stg.id,
                    'name', p_stg.name,
                    'type', p_stg.type
                )
            )
        ) AS data -- noqa
    FROM flex.party_staging AS p_stg -- noqa
        LEFT JOIN flex.entity AS e_stg
            ON p_stg.org = e_stg.business_id
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
    WHERE NOT EXISTS (
            SELECT 1 FROM flex.party AS p
            WHERE p.business_id = p_stg.gln
        )

    -- parties already in the system, but with staging updates
    UNION ALL
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.outdated' AS type, -- noqa
        '/party/' || p.id AS source,
        jsonb_strip_nulls(
            jsonb_build_object(
                'entity',
                (CASE WHEN p_stg.org != e.business_id
                        THEN jsonb_build_object(
                                'business_id', p_stg.org,
                                'business_id_type', e_stg.business_id_type,
                                'name', e_stg.name,
                                'type', e_stg.type
                            )
                END),
                'party', jsonb_build_object(
                    'name', (
                        CASE WHEN p_stg.name != p.name THEN p_stg.name END
                    ),
                    'entity_id', (
                        CASE WHEN p_stg.org != e.business_id THEN e_stg.id END
                    )
                )
            )
        ) AS data -- noqa
    FROM flex.party AS p -- noqa
        INNER JOIN flex.entity AS e
            ON p.entity_id = e.id
        INNER JOIN flex.party_staging AS p_stg
            ON p.business_id = p_stg.gln
                -- party has changed name or owning entity
                AND (p.name != p_stg.name OR e.business_id != p_stg.org)
        LEFT JOIN flex.entity AS e_stg
            ON p_stg.org = e_stg.business_id
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'

    -- parties deleted after sync, but still actually in the system
    UNION ALL
    SELECT
        p_fiso.id AS party_id,
        'no.elhub.flex.party.residual' AS type, -- noqa
        '/party/' || p.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.party AS p -- noqa
        -- warn all FISOs
        INNER JOIN flex.party AS p_fiso
            ON p_fiso.type = 'flexibility_information_system_operator'
    WHERE p.business_id_type = 'gln'
        AND p.status != 'terminated'
        AND NOT EXISTS (
            SELECT 1 FROM flex.party_staging AS p_stg
            WHERE p_stg.gln = p.business_id
        )

    -- suspension on product type no longer qualified
    UNION ALL
    (
        WITH
            qualified_product_types AS (
                SELECT
                    sppa.service_provider_id,
                    sppa.system_operator_id,
                    array_agg(DISTINCT sppa.product_type_id) AS product_type_ids
                FROM (
                    SELECT
                        sppa.service_provider_id,
                        sppa.system_operator_id,
                        unnest(sppa.product_type_ids) AS product_type_id
                    FROM flex.service_provider_product_application AS sppa
                    WHERE sp_product_application_ready_for_market_check(sppa) -- noqa
                ) AS sppa
                GROUP BY sppa.service_provider_id, sppa.system_operator_id
            )

        SELECT
            spps.procuring_system_operator_id AS party_id,
            'no.elhub.flex.service_provider_product_suspension.product_type.not_qualified' AS type, -- noqa
            '/service_provider_product_suspension/' || spps.id AS source,
            jsonb_build_object(
                'product_type_ids', (
                    SELECT array(
                        SELECT unnest(spps.product_type_ids)
                        EXCEPT
                        SELECT unnest(coalesce(qpts.product_type_ids, '{}'))
                    )
                )
            ) AS data -- noqa
        FROM flex.service_provider_product_suspension AS spps
            LEFT JOIN qualified_product_types AS qpts
                ON spps.service_provider_id = qpts.service_provider_id
                    AND spps.procuring_system_operator_id
                    = qpts.system_operator_id
        WHERE NOT spps.product_type_ids <@ coalesce(qpts.product_type_ids, '{}')
    )

    -- inactive suspension
    UNION ALL
    SELECT
        spps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_suspension.lingering' AS type, -- noqa
        '/service_provider_product_suspension/' || spps.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.service_provider_product_suspension AS spps
    WHERE lower(spps.record_time_range) < current_timestamp - interval '2 weeks'
        AND NOT EXISTS (
            SELECT 1
            FROM flex.service_provider_product_suspension_comment AS sppsc
            WHERE spps.id = sppsc.service_provider_product_suspension_id
                AND lower(sppsc.record_time_range)
                >= current_timestamp - interval '2 weeks'
        )

    -- suspension on SPG no longer qualified
    UNION ALL
    SELECT
        spggs.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_suspension.not_grid_prequalified' AS type, -- noqa
        '/service_providing_group_grid_suspension/' || spggs.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_grid_suspension AS spggs
    WHERE NOT EXISTS (
            SELECT 1
            FROM flex.service_providing_group_grid_prequalification AS spggp
            WHERE spggp.service_providing_group_id
                = spggs.service_providing_group_id
                AND spggp.impacted_system_operator_id
                = spggs.impacted_system_operator_id
                AND spg_grid_prequalification_ready_for_market_check(spggp) -- noqa
        )

    -- inactive suspension
    UNION ALL
    SELECT
        spggs.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_suspension.lingering' AS type, -- noqa
        '/service_providing_group_grid_suspension/' || spggs.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_grid_suspension AS spggs
    WHERE lower(spggs.record_time_range)
        < current_timestamp - interval '2 weeks'

    -- suspension on product type no longer qualified
    UNION ALL
    (
        WITH
            qualified_product_types AS (
                SELECT
                    spgpa.service_providing_group_id,
                    spgpa.procuring_system_operator_id,
                    array_agg(DISTINCT spgpa.product_type_id)
                        AS product_type_ids -- noqa
                FROM (
                    SELECT
                        spgpa.service_providing_group_id,
                        spgpa.procuring_system_operator_id,
                        unnest(spgpa.product_type_ids) AS product_type_id
                    FROM
                        flex.service_providing_group_product_application
                            AS spgpa -- noqa
                    WHERE spg_product_application_ready_for_market_check(spgpa) -- noqa
                ) AS spgpa
                GROUP BY
                    spgpa.service_providing_group_id,
                    spgpa.procuring_system_operator_id
            )

        SELECT
            spgps.procuring_system_operator_id AS party_id,
            'no.elhub.flex.service_providing_group_product_suspension.product_type.not_qualified' AS type, -- noqa
            '/service_providing_group_product_suspension/'
            || spgps.id AS source,
            jsonb_build_object(
                'product_type_ids', (
                    SELECT array(
                        SELECT unnest(spgps.product_type_ids)
                        EXCEPT
                        SELECT unnest(coalesce(qpts.product_type_ids, '{}'))
                    )
                )
            ) AS data -- noqa
        FROM flex.service_providing_group_product_suspension AS spgps
            LEFT JOIN qualified_product_types AS qpts
                ON spgps.service_providing_group_id
                    = qpts.service_providing_group_id
                    AND spgps.procuring_system_operator_id
                    = qpts.procuring_system_operator_id
        WHERE NOT spgps.product_type_ids
            <@ coalesce(qpts.product_type_ids, '{}')
    )

    -- inactive suspension
    UNION ALL
    SELECT
        spgps.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_suspension.lingering'
            AS type, -- noqa
        '/service_providing_group_product_suspension/' || spgps.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_product_suspension AS spgps
    WHERE lower(spgps.record_time_range)
        < current_timestamp - interval '2 weeks'

    -- inactive suspension
    UNION ALL
    SELECT
        cus.impacted_system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit_suspension.lingering'
            AS type, -- noqa
        '/controllable_unit_suspension/' || cus.id AS source,
        null::jsonb AS data -- noqa
    FROM flex.controllable_unit_suspension AS cus
    WHERE lower(cus.record_time_range)
        < current_timestamp - interval '2 weeks'
);
