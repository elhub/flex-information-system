--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-service-providing-group-grid-suspension runAlways:true endDelimiter:--

-- Suspension on SPG no longer qualified
DROP VIEW IF EXISTS notice_spggs_not_grid_prequalified CASCADE;
CREATE VIEW notice_spggs_not_grid_prequalified
WITH (security_invoker = false) AS (
    SELECT
        spggs.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_suspension.not_grid_prequalified'::ltree AS type, -- noqa
        'service_providing_group_grid_suspension' AS source_resource,
        spggs.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spggs.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_grid_suspension AS spggs
    WHERE NOT EXISTS (
        SELECT 1
        FROM flex.service_providing_group_grid_prequalification AS spggp
        WHERE
            spggp.service_providing_group_id
            = spggs.service_providing_group_id
            AND spggp.impacted_system_operator_id
            = spggs.impacted_system_operator_id
                AND spg_grid_prequalification_ready_for_market_check(spggp) -- noqa
    )
);

-- Inactive suspension
DROP VIEW IF EXISTS notice_spggs_lingering CASCADE;
CREATE VIEW notice_spggs_lingering
WITH (security_invoker = false) AS (
    SELECT
        spggs.impacted_system_operator_id AS party_id,
        'no.elhub.flex.service_providing_group_grid_suspension.lingering'::ltree AS type, -- noqa
        'service_providing_group_grid_suspension' AS source_resource,
        spggs.id AS source_id,
        null::jsonb AS data, -- noqa
        md5(spggs.id::text) AS deduplication_key -- noqa
    FROM flex.service_providing_group_grid_suspension AS spggs
    WHERE
        lower(spggs.record_time_range)
        < current_timestamp - interval '2 weeks'
);
