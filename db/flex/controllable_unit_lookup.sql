CREATE OR REPLACE FUNCTION controllable_unit_lookup(
    l_end_user_id bigint,
    l_business_id text,
    l_accounting_point_id text
)
RETURNS TABLE (
    id bigint,
    business_id text,
    name text,
    accounting_point_id text,
    end_user_id bigint,
    technical_resources jsonb
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    l_event_data jsonb;
BEGIN
    SELECT ('{"requesting_party_name": "' || p.name || '"}')::jsonb
    INTO l_event_data
    FROM flex.party AS p WHERE p.id = flex.current_party();

    FOR
        -- define all the fields of the row to return
        id,
        business_id,
        name,
        accounting_point_id,
        end_user_id,
        technical_resources
    IN (
        SELECT
            cu.id,
            cu.business_id::text,
            cu.name,
            cu.accounting_point_id,
            apeu.end_user_id,
            (
                SELECT json_agg(row_to_json(tr))
                FROM (
                    SELECT tr.id, tr.name, tr.details
                    FROM flex.technical_resource AS tr
                    WHERE tr.controllable_unit_id = cu.id
                ) AS tr
            ) AS technical_resources
        FROM flex.controllable_unit AS cu
            INNER JOIN flex.accounting_point AS ap
                ON cu.accounting_point_id = ap.business_id
            INNER JOIN flex.accounting_point_end_user AS apeu
                ON ap.id = apeu.accounting_point_id
        WHERE apeu.valid_time_range @> current_timestamp
            AND apeu.end_user_id = l_end_user_id
            -- one of these fields must not be null
            AND (l_business_id IS NOT NULL OR l_accounting_point_id IS NOT NULL)
            -- if a field is null, ignore the filter
            AND (coalesce(cu.business_id = l_business_id::uuid, true))
            AND (coalesce(cu.accounting_point_id = l_accounting_point_id, true))
    )
    LOOP
        INSERT INTO flex.event (
            type,
            source,
            data
        ) VALUES (
            text2ltree('no.elhub.flex.controllable_unit.lookup'),
            '/controllable_unit/' || id,
            l_event_data
        );

        -- all fields are defined, so this adds a new row to the returned table
        RETURN NEXT;
    END LOOP;
END;
$$;
