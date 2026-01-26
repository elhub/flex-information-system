--liquibase formatted sql
-- Manually managed file

-- changeset flex:notice-controllable-unit-service-provider runAlways:true endDelimiter:--

DROP VIEW IF EXISTS notice_cusp_valid_time_outside_contract CASCADE;
-- CUSPs not fully covered by the end user contract
CREATE VIEW notice_cusp_valid_time_outside_contract
WITH (security_invoker = false) AS (
    SELECT
        service_provider_id AS party_id,
        'no.elhub.flex.controllable_unit_service_provider.valid_time.outside_contract' AS type, -- noqa
        'controllable_unit_service_provider' AS source_resource,
        id AS source_id,
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
                ON
                    cu.accounting_point_id = apeu.accounting_point_id
                    AND cusp.end_user_id = apeu.end_user_id
                    AND cusp.valid_time_range && apeu.valid_time_range
        GROUP BY cusp.id
    ) AS cusp_with_eu
    WHERE NOT end_user_timeline @> valid_time_range
);
