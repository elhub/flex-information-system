--liquibase formatted sql
-- Manually managed file

-- changeset flex:api-current-controllable-unit-accounting-point endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION
api.current_controllable_unit_accounting_point(
    l_controllable_unit_business_id text
)
RETURNS TABLE (
    accounting_point_id bigint,
    accounting_point_business_id text
)
SECURITY DEFINER -- SP has the CU's business ID but cannot necessarily read it
LANGUAGE sql
AS $$
    SELECT
        ap.id AS accounting_point_id,
        ap.business_id AS accounting_point_business_id
    FROM flex.controllable_unit AS cu
        INNER JOIN flex.accounting_point AS ap
            ON cu.accounting_point_id = ap.id
    WHERE cu.business_id = l_controllable_unit_business_id::uuid;
$$;

-- changeset flex:api-controllable-unit-lookup-check-end-user-matches-accounting-point endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION
api.controllable_unit_lookup_check_end_user_matches_accounting_point(
    l_end_user_business_id text,
    l_accounting_point_business_id text
)
RETURNS TABLE (
    end_user_id bigint
)
SECURITY DEFINER -- AP-EU is internal
LANGUAGE sql
AS $$
    SELECT p.id AS end_user_id
    FROM flex.accounting_point AS ap
        INNER JOIN flex.accounting_point_end_user AS apeu
            ON ap.id = apeu.accounting_point_id
        INNER JOIN flex.party AS p
            ON apeu.end_user_id = p.id
        INNER JOIN flex.entity AS e
            ON p.entity_id = e.id
    WHERE ap.business_id = l_accounting_point_business_id
        AND e.business_id = l_end_user_business_id
        AND apeu.valid_time_range @> current_timestamp;
$$;

-- changeset flex:api-controllable-unit-lookup endDelimiter:-- runAlways:true
CREATE OR REPLACE FUNCTION api.controllable_unit_lookup(
    l_controllable_unit_business_id text,
    l_accounting_point_business_id text
)
RETURNS TABLE (
    controllable_units jsonb
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_event_data jsonb;
    l_cus jsonb;
BEGIN
    SELECT coalesce(jsonb_agg(row_to_json(cu)), '[]'::jsonb) INTO l_cus
    FROM (
        SELECT
            cu.id,
            cu.business_id::text,
            cu.name,
            (
                SELECT coalesce(jsonb_agg(row_to_json(tr)), '[]'::jsonb)
                FROM (
                    SELECT tr.id, tr.name, tr.details
                    FROM flex.technical_resource AS tr
                    WHERE tr.controllable_unit_id = cu.id
                ) AS tr
            ) AS technical_resources
        FROM flex.controllable_unit AS cu
            INNER JOIN flex.accounting_point AS ap
                ON cu.accounting_point_id = ap.id
            AND coalesce(
                cu.business_id = l_controllable_unit_business_id::uuid,
                true
            ) AND coalesce(
                ap.business_id = l_accounting_point_business_id,
                true
            )
    ) AS cu;

    SELECT jsonb_build_object('requesting_party_name', p.name)
    INTO l_event_data
    FROM flex.party AS p WHERE p.id = (SELECT flex.current_party());

    INSERT INTO flex.event (
        type,
        source_resource,
        source_id,
        data
    ) SELECT
        text2ltree('no.elhub.flex.controllable_unit.lookup'),
        'controllable_unit',
        (cu->'id')::bigint,
        l_event_data
    FROM jsonb_array_elements(l_cus) AS cu;

    RETURN QUERY SELECT l_cus;
END;
$$;
