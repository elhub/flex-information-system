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
    WHERE
        NOT (
            SELECT
                -- aggregate returns null if no overlapping range is found
                --   null propagates to WHERE through range_agg, @> and NOT,
                --   whereas we want true in this case, hence coalesce
                coalesce(
                    range_agg(cusp.valid_time_range) @> spgm.valid_time_range,
                    false
                )
            FROM controllable_unit_service_provider AS cusp
            WHERE
                cusp.controllable_unit_id = spgm.controllable_unit_id
                AND cusp.service_provider_id = spg.service_provider_id
                AND cusp.valid_time_range && spgm.valid_time_range
        )
);
