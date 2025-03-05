CREATE OR REPLACE VIEW notice AS (
    -- CU grid node ID missing
    SELECT
        row_number() OVER () AS id,
        apt.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_node_id.missing' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN accounting_point AS apt
            ON cu.accounting_point_id = apt.business_id
    WHERE cu.grid_node_id IS null

    -- CU grid validation status pending
    UNION ALL
    SELECT
        row_number() OVER () AS id,
        apt.system_operator_id AS party_id,
        'no.elhub.flex.controllable_unit.grid_validation_status.pending' AS type, -- noqa
        '/controllable_unit/' || cu.id AS source,
        null AS data -- noqa
    FROM controllable_unit AS cu
        INNER JOIN accounting_point AS apt
            ON cu.accounting_point_id = apt.business_id
    WHERE cu.grid_validation_status = 'pending'

    -- CU grid validation status incomplete information
    UNION ALL
    SELECT
        row_number() OVER () AS id,
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
        row_number() OVER () AS id,
        sppa.system_operator_id AS party_id,
        'no.elhub.flex.service_provider_product_application.status.requested' AS type, -- noqa
        '/service_provider_product_application/' || sppa.id AS source,
        null AS data -- noqa
    FROM service_provider_product_application AS sppa
    WHERE sppa.status = 'requested'

    -- SPGM inconsistency
    UNION ALL
    SELECT -- noqa
        row_number() OVER () AS id,
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_membership.valid_time.outside_contract' AS type, -- noqa
        '/service_providing_group_membership/' || spgm.id AS source,
        null AS data -- noqa
    FROM service_providing_group_membership AS spgm -- noqa
        INNER JOIN service_providing_group AS spg
            ON spg.id = spgm.service_providing_group_id
    WHERE NOT EXISTS (
            SELECT 1 FROM (
                SELECT
                    controllable_unit_id,
                    service_provider_id,
                    range_agg(valid_time_range) AS valid_timeline
                FROM controllable_unit_service_provider
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
        row_number() OVER () AS id,
        spgpa.procuring_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_product_application.status.requested' AS type, -- noqa
        '/service_providing_group_product_application/' || spgpa.id AS source,
        null AS data -- noqa
    FROM service_providing_group_product_application AS spgpa
    WHERE spgpa.status = 'requested'

    -- SPG grid prequalification status requested
    UNION ALL
    SELECT
        row_number() OVER () AS id,
        spggp.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_prequalification.status.requested' AS type, -- noqa
        '/service_providing_group_grid_prequalification/' || spggp.id AS source,
        null AS data -- noqa
    FROM service_providing_group_grid_prequalification AS spggp
    WHERE spggp.status = 'requested'
);
