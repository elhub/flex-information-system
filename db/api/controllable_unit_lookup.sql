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

-- changeset flex:api-controllable-unit-lookup-sync-accounting-point endDelimiter:-- runAlways:true
-- this function creates an accounting point and makes sure some related data is also in place
-- (mainly MGA, AP-MGA, AP-EU)
CREATE OR REPLACE FUNCTION api.controllable_unit_lookup_sync_accounting_point(
    in_accounting_point_business_id text,
    in_metering_grid_area_business_id text,
    in_metering_grid_area_name text,
    in_metering_grid_area_price_area text,
    in_system_operator_org text,
    in_system_operator_gln text,
    in_system_operator_name text,
    in_end_user_business_id text
)
RETURNS TABLE (
    accounting_point_id bigint
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_ap_id bigint;
    l_so_entity_id bigint;
    l_so_party_id bigint;
    l_mga_id bigint;
    l_eu_entity_id bigint;
    l_eu_party_id bigint;
BEGIN
    -- we must insert data for AP, AP-MGA and AP-EU

    -- AP is independent

    INSERT INTO flex.accounting_point (business_id)
    VALUES (in_accounting_point_business_id)
    RETURNING id INTO l_ap_id;

    -- AP-MGA requires MGA, which requires SO party, which requires SO entity

    INSERT INTO flex.entity (name, type, business_id, business_id_type)
    VALUES (
        in_system_operator_name,
        'organisation',
        in_system_operator_org,
        'org'
    )
    RETURNING id INTO l_so_entity_id;

    INSERT INTO flex.party (
        business_id,
        business_id_type,
        entity_id,
        name,
        type
        role,
        status,
    ) VALUES (
        in_system_operator_gln,
        'gln',
        l_so_entity_id,
        in_system_operator_name || ' - SO',
        'system_operator',
        'flex_system_operator',
        'active'
    )
    RETURNING id INTO l_so_party_id;

    INSERT INTO flex.metering_grid_area (
        business_id,
        name,
        price_area,
        system_operator_id,
        valid_time_range
    ) VALUES (
        in_metering_grid_area_business_id,
        in_metering_grid_area_name,
        in_metering_grid_area_price_area,
        l_so_party_id,
        tstzrange(current_timestamp, null, '[)')
    )
    RETURNING id INTO l_mga_id;

    INSERT INTO flex.accounting_point_metering_grid_area (
        accounting_point_id,
        metering_grid_area_id,
        valid_time_range
    ) VALUES (
        l_ap_id,
        l_mga_id,
        tstzrange(current_timestamp, null, '[)')
    );

    -- AP-EU requires EU party, which requires EU entity

    -- Note:
    --   We do not have access to the end user's name, so we use the AP ID.
    --   FISO is supposed to edit this data afterwards.

    INSERT INTO flex.entity (name, type, business_id, business_id_type)
    VALUES (
        in_accounting_point_business_id || ' - ENT',
        'person',
        in_end_user_business_id,
        'pid'
    )
    RETURNING id INTO l_eu_entity_id;

    INSERT INTO flex.party (
        entity_id,
        name,
        type
        role,
        status,
    ) VALUES (
        l_eu_entity_id,
        in_accounting_point_business_id || ' - EU',
        'end_user',
        'flex_end_user',
        'active'
    )
    RETURNING id INTO l_eu_party_id;

    INSERT INTO flex.accounting_point_end_user (
        accounting_point_id,
        end_user_id,
        valid_time_range
    ) VALUES (
        l_ap_id,
        l_eu_party_id,
        tstzrange(current_timestamp, null, '[)')
    );

    RETURN QUERY SELECT l_ap_id AS accounting_point_id;
END;
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
