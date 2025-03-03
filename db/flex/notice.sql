CREATE OR REPLACE VIEW notice AS (
    -- SPGM inconsistency
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
);
