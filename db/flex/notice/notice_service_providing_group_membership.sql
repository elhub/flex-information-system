--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-membership runAlways:true endDelimiter:--

-- SPGM CUSP inconsistency
DROP VIEW IF EXISTS notice_spgm_valid_time_outside_contract CASCADE;
CREATE VIEW notice_spgm_valid_time_outside_contract
WITH (security_invoker = false) AS (
    SELECT -- noqa
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_membership.valid_time.outside_contract' AS type, -- noqa
        'service_providing_group_membership' AS source_resource,
        spgm.id AS source_id,
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
        WHERE
            spgm.controllable_unit_id = cusp.controllable_unit_id
            AND spg.service_provider_id = cusp.service_provider_id
            AND cusp.valid_timeline @> spgm.valid_time_range
    )
);

-- SPGM CUBZ inconsistency
DROP VIEW IF EXISTS notice_spgm_bidding_zone_mismatch CASCADE;
CREATE VIEW notice_spgm_bidding_zone_mismatch
WITH (security_invoker = false) AS (
    SELECT -- noqa
        spg.service_provider_id AS party_id,
        'no.elhub.flex.service_providing_group_membership.bidding_zone_mismatch' AS type, -- noqa
        'service_providing_group_membership' AS source_resource,
        spgm.id AS source_id,
        null::jsonb AS data -- noqa
    FROM flex.service_providing_group_membership AS spgm -- noqa
        INNER JOIN flex.service_providing_group AS spg
            ON spgm.service_providing_group_id = spg.id
    WHERE NOT EXISTS (
        SELECT 1 FROM (
            SELECT
                controllable_unit_id,
                bidding_zone,
                range_agg(valid_time_range) AS valid_timeline
            FROM flex.controllable_unit_bidding_zone
            GROUP BY controllable_unit_id, bidding_zone
        ) AS cubz
        WHERE
            spgm.controllable_unit_id = cubz.controllable_unit_id
            AND spg.bidding_zone = cubz.bidding_zone
            AND cubz.valid_timeline @> spgm.valid_time_range
    )
);
