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
-- (AP, AP-MGA, AP-EU, creating the end user)
CREATE OR REPLACE FUNCTION api.controllable_unit_lookup_sync_accounting_point(
    in_accounting_point_business_id text,
    in_metering_grid_area_business_id text,
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
    l_mga_id bigint;
    l_valid_from timestamptz;
    l_end_user_type text;
    l_end_user_business_id_type text;
    l_eu_entity_id bigint;
    l_eu_party_id bigint;
BEGIN
    -- create AP from business ID

    IF NOT EXISTS (
        SELECT 1 FROM flex.accounting_point AS ap
        WHERE ap.business_id = in_accounting_point_business_id
    ) THEN
        INSERT INTO flex.accounting_point (business_id)
        VALUES (in_accounting_point_business_id)
        RETURNING id INTO l_ap_id;
    ELSE
        SELECT ap.id INTO l_ap_id
        FROM flex.accounting_point AS ap
        WHERE ap.business_id = in_accounting_point_business_id;
    END IF;

    -- find MGA by business ID and create AP-MGA

    SELECT mga.id INTO l_mga_id
    FROM flex.metering_grid_area AS mga
    WHERE mga.business_id = in_metering_grid_area_business_id
        AND mga.valid_time_range @> current_timestamp;

    -- we assume the links between the AP and the MGA/EU are valid from a few
    -- days back in time
    l_valid_from := (
        (current_date - '2 days'::interval)::text || ' Europe/Oslo'
    )::timestamptz;

    INSERT INTO flex.accounting_point_metering_grid_area (
        accounting_point_id,
        metering_grid_area_id,
        valid_time_range
    ) VALUES (
        l_ap_id,
        l_mga_id,
        tstzrange(l_valid_from, null, '[)')
    );

    -- AP-EU requires EU party, which requires EU entity
    -- we create each of them if they do not already exist

    -- Note:
    --   We do not have access to the end user's name, so if we have to create
    --   an entity or party, we use the AP ID as name. FISO is supposed to edit
    --   this data afterwards.

    IF NOT EXISTS (
        SELECT 1 FROM flex.entity AS e
        WHERE e.business_id = in_end_user_business_id
    ) THEN
        -- end user can be person or organisation
        IF flex.validate_business_id(in_end_user_business_id, 'pid') THEN
            l_end_user_business_id_type := 'pid';
            l_end_user_type := 'person';
        ELSE
            l_end_user_business_id_type := 'org';
            l_end_user_type := 'organisation';
        END IF;

        INSERT INTO flex.entity (name, type, business_id, business_id_type)
        VALUES (
            in_accounting_point_business_id || ' - ENT',
            l_end_user_type,
            in_end_user_business_id,
            l_end_user_business_id_type
        )
        RETURNING id INTO l_eu_entity_id;
    ELSE
        SELECT e.id INTO l_eu_entity_id
        FROM flex.entity AS e
        WHERE e.business_id = in_end_user_business_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM flex.party AS p
        WHERE p.entity_id = l_eu_entity_id AND p.type = 'end_user'
    ) THEN
        INSERT INTO flex.party (
            entity_id,
            name,
            type,
            role,
            status
        ) VALUES (
            l_eu_entity_id,
            in_accounting_point_business_id || ' - EU',
            'end_user',
            'flex_end_user',
            'active'
        )
        RETURNING id INTO l_eu_party_id;
    ELSE
        SELECT p.id INTO l_eu_party_id
        FROM flex.party AS p
        WHERE p.entity_id = l_eu_entity_id AND p.type = 'end_user';
    END IF;

    INSERT INTO flex.accounting_point_end_user (
        accounting_point_id,
        end_user_id,
        valid_time_range
    ) VALUES (
        l_ap_id,
        l_eu_party_id,
        tstzrange(l_valid_from, null, '[)')
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
