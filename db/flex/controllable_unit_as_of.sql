--liquibase formatted sql
-- Manually managed file

-- changeset flex:controllable-unit-as-of-create runOnChange:true endDelimiter:--
CREATE OR REPLACE VIEW controllable_unit_as_of AS (
    WITH
        cu_as_of_data AS (
            SELECT
                controllable_unit_id,
                party_id,
                as_of
            FROM (
                SELECT
                    cusp.controllable_unit_id,
                    cusp.service_provider_id AS party_id,
                    -- rank rows by descending valid_from to select only the
                    -- latest row for each CU/SP combination, so that the upper
                    -- bound we use below is the end of the CUSP timeline
                    row_number() OVER (
                        PARTITION BY
                            cusp.controllable_unit_id, cusp.service_provider_id
                        ORDER BY lower(cusp.valid_time_range) DESC
                    ) AS rank,
                    -- `least` skips null arguments, so if the CUSP timeline is
                    -- open-ended, the as-of timestamp is now, as expected
                    least(
                        upper(cusp.valid_time_range), current_timestamp
                    ) AS as_of
                FROM flex.controllable_unit_service_provider AS cusp
            ) AS ranked_cusp
            WHERE rank = 1
        )

    SELECT *
    FROM cu_as_of_data
    -- default as-of timestamp is now if such a filtering mechanism does not
    -- apply to the party querying this view (i.e., not an SP)
    UNION ALL
    SELECT
        cu.id AS controllable_unit_id,
        flex.current_party() AS party_id,
        current_timestamp AS as_of
    FROM flex.controllable_unit AS cu
    WHERE current_role != 'flex_service_provider'
        AND NOT EXISTS (
            SELECT 1
            FROM cu_as_of_data AS cu_asof
            WHERE cu_asof.controllable_unit_id = cu.id
                AND cu_asof.party_id = flex.current_party()
        )
);

-- changeset flex:controllable-unit-as-of-grants runAlways:true endDelimiter:;
GRANT SELECT ON TABLE controllable_unit_as_of
TO flex_common;
